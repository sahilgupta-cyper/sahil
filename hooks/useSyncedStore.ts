import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Mock KeyValueStore interface, assuming it's provided globally.
// FIX: Refactored global type declarations to augment the `AIStudio` interface,
// resolving conflicts with other type definitions for `window.aistudio`.
declare global {
  interface AIStudio {
    keyValueStore?: {
      get: (key: string) => Promise<string | undefined>;
      set: (key: string, value: string) => Promise<void>;
      subscribe: (key: string, callback: () => void) => () => void;
    };
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const getStore = () => window.aistudio?.keyValueStore;

type SyncableItem = { id: string; lastModified?: string };
type SyncableArray<T extends SyncableItem> = T[];

export function useSyncedStore<T extends SyncableItem>(
    key: string, 
    initialValue: SyncableArray<T>
): [SyncableArray<T>, React.Dispatch<React.SetStateAction<SyncableArray<T>>>] {
    
    const [localState, setLocalState] = useLocalStorage<SyncableArray<T>>(key, initialValue);
    const isUpdatingFromCloud = useRef(false);
    const hasSyncedInitially = useRef(false);

    const mergeData = useCallback((local: SyncableArray<T>, cloud: SyncableArray<T>): SyncableArray<T> => {
        const cloudMap = new Map(cloud.map(item => [item.id, item]));
        const mergedMap = new Map(local.map(item => [item.id, item]));

        for (const [id, cloudItem] of cloudMap.entries()) {
            const localItem = mergedMap.get(id);
            // If local doesn't have it, or cloud version is newer, update/add it.
            if (!localItem || (cloudItem.lastModified && localItem.lastModified && new Date(cloudItem.lastModified) > new Date(localItem.lastModified))) {
                mergedMap.set(id, cloudItem);
            }
        }
        
        return Array.from(mergedMap.values());
    }, []);
    
    // Effect for initial load and subscribing to remote changes
    useEffect(() => {
        const store = getStore();
        if (!store) {
            console.warn("KeyValueStore not available. Running in offline-only mode.");
            return;
        }

        let isMounted = true;

        const syncFromCloud = async () => {
            try {
                const cloudDataStr = await store.get(key);
                if (!isMounted) return;

                const cloudData = cloudDataStr ? (JSON.parse(cloudDataStr) as SyncableArray<T>) : [];
                
                isUpdatingFromCloud.current = true;
                setLocalState(currentLocal => mergeData(currentLocal, cloudData));
                
                hasSyncedInitially.current = true;

            } catch (error) {
                console.error(`Failed to sync from cloud for key "${key}":`, error);
            } finally {
                setTimeout(() => {
                    if (isMounted) isUpdatingFromCloud.current = false;
                }, 100);
            }
        };

        syncFromCloud();

        const unsubscribe = store.subscribe(key, syncFromCloud);
        
        return () => {
            isMounted = false;
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, mergeData]);


    // Effect to push local changes to the cloud
    useEffect(() => {
        if (isUpdatingFromCloud.current || !hasSyncedInitially.current) return;

        const store = getStore();
        if (!store) return;
        
        // Push the entire local state to the cloud. Last write wins.
        store.set(key, JSON.stringify(localState)).catch(err => console.error("Failed to push to store", err));

    }, [localState, key]);

    return [localState, setLocalState];
}
