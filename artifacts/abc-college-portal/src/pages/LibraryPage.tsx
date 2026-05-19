import React, { useState } from 'react';
import { SectionTitle } from '../components/SectionTitle';
import { cardClass, daysUntil, formatDate } from '../lib/utils';
import { useAuthContext } from '../context/AuthContext';
import { useStore } from '../hooks/useStore';
import { Book } from '../types';
import { Search, BookMarked, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function LibraryPage() {
  const { currentUser } = useAuthContext();
  const [books] = useStore<Book[]>('abc_books', []);
  const [requests, setRequests] = useStore<any[]>('abc_book_requests', []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const myBooks = books.filter(b => b.status === 'Issued' && b.issuedTo === currentUser?.id);
  const categories = ['All', ...Array.from(new Set(books.map(b => b.category)))];

  const filteredBooks = books.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || b.category === category;
    return matchSearch && matchCat;
  });

  const handleRequest = (book: Book) => {
    if (requests.find(r => r.bookId === book.id && r.userId === currentUser?.id)) {
      return toast.error('Already requested this book');
    }
    setRequests(prev => [...prev, { id: `req${Date.now()}`, bookId: book.id, userId: currentUser!.id, status: 'Pending', date: new Date().toISOString() }]);
    toast.success('Book request submitted');
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Library" subtitle="Search catalogue and manage issued books" />

      {myBooks.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Issued to You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBooks.map(b => {
              const remaining = daysUntil(b.dueDate!);
              const overdue = remaining < 0;
              const fine = overdue ? Math.abs(remaining) * 5 : 0;

              return (
                <div key={b.id} className={cardClass(`flex items-start gap-4 ${overdue ? 'ring-2 ring-red-500' : ''}`)}>
                  <div className="w-12 h-16 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center shrink-0">
                    <BookMarked className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-2 leading-tight mb-1">{b.title}</h4>
                    <p className="text-xs text-slate-500 mb-2">Due: {formatDate(b.dueDate!)}</p>
                    {overdue ? (
                      <span className="badge bg-red-100 text-red-800 flex items-center w-fit">
                        <AlertCircle className="w-3 h-3 mr-1" /> Fine: ₹{fine}
                      </span>
                    ) : (
                      <span className="badge bg-green-100 text-green-800">
                        {remaining} days left
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={cardClass()}>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title or author..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input sm:w-48">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBooks.map(b => (
            <div key={b.id} className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors flex flex-col h-full">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{b.category}</span>
              <h4 className="font-semibold text-slate-900 dark:text-white leading-tight mb-1">{b.title}</h4>
              <p className="text-sm text-slate-500 mb-4">{b.author}</p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${b.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {b.status}
                </span>
                {b.status === 'Available' && (
                  <button onClick={() => handleRequest(b)} className="text-xs font-medium text-primary hover:underline">
                    Request
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No books found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
