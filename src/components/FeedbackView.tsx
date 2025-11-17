import React, { useState, useMemo } from 'react';
import { Feedback, Client } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { PlusIcon, StarIcon } from './Icons';
import Input from './common/Input';

interface StarRatingProps {
    rating: number;
    setRating: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        type="button"
                        key={ratingValue}
                        className={`transition-colors duration-200 ${ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <StarIcon className="w-8 h-8" fill="currentColor" strokeWidth={0} />
                    </button>
                );
            })}
        </div>
    );
};


interface FeedbackModalProps {
    onClose: () => void;
    onSave: (feedback: Omit<Feedback, 'id' | 'date' | 'lastModified'>) => void;
    clients: Client[];
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, onSave, clients }) => {
    const [selectedClientId, setSelectedClientId] = useState<string>('walk-in');
    const [clientName, setClientName] = useState('');
    const [rating, setRating] = useState(0);
    const [comments, setComments] = useState('');

    const handleSubmit = () => {
        if (rating === 0) return; // Rating is mandatory
        
        const client = clients.find(c => c.phone === selectedClientId);
        const finalClientName = client ? client.name : clientName || 'Walk-in';
        const finalClientId = client ? client.phone : null;
        
        onSave({ clientId: finalClientId, clientName: finalClientName, rating, comments });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-lg shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-base-300">
                    <h2 className="text-xl font-bold text-neutral">Submit Feedback</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Client</label>
                        <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full bg-base-100 border border-base-300 rounded-md py-2 px-3 text-neutral focus:ring-primary focus:border-primary">
                            <option value="walk-in">Walk-in Customer</option>
                            {clients.map(c => <option key={c.phone} value={c.phone}>{c.name}</option>)}
                        </select>
                    </div>
                    {selectedClientId === 'walk-in' && (
                        <Input label="Client Name (Optional)" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Enter client's name" />
                    )}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Rating*</label>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Comments</label>
                        <textarea value={comments} onChange={e => setComments(e.target.value)} rows={4} className="w-full bg-base-100 border border-base-300 rounded-md p-3 text-neutral" placeholder="Share your experience..."></textarea>
                    </div>
                </div>
                <div className="flex-shrink-0 p-4 bg-base-200 flex justify-end space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit Feedback</Button>
                </div>
            </div>
        </div>
    );
};

interface FeedbackViewProps {
  feedbacks: Feedback[];
  clients: Client[];
  onAddFeedback: (feedback: Omit<Feedback, 'id' | 'date' | 'lastModified'>) => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ feedbacks, clients, onAddFeedback }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {isModalOpen && <FeedbackModal onClose={() => setIsModalOpen(false)} onSave={onAddFeedback} clients={clients} />}
      <Card className="p-0">
        <div className="p-6 border-b border-base-300 flex justify-between items-center">
            <h2 className="text-xl font-bold text-neutral font-serif">Client Feedbacks</h2>
            <Button onClick={() => setIsModalOpen(true)}>
                <PlusIcon className="w-4 h-4" /> Add Feedback
            </Button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {feedbacks.map(fb => (
                <div key={fb.id} className="bg-base-200 p-4 rounded-lg border border-base-300">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-bold text-neutral">{fb.clientName}</p>
                            <p className="text-xs text-secondary">{new Date(fb.date).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="flex">
                            {[...Array(fb.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-yellow-400" fill="currentColor"/>)}
                            {[...Array(5 - fb.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-gray-300" fill="currentColor"/>)}
                        </div>
                    </div>
                    <p className="text-sm text-secondary italic">"{fb.comments || 'No comments left.'}"</p>
                </div>
            ))}
            {feedbacks.length === 0 && (
                <div className="col-span-full text-center py-20 text-secondary">
                    No feedback has been submitted yet.
                </div>
            )}
        </div>
      </Card>
    </>
  );
};

export default FeedbackView;