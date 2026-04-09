import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LifeBuoy, Send, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestoreErrorHandler';

export default function Support() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error('You must be logged in to submit a ticket');
      return;
    }

    if (!formData.title || !formData.subject || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const path = 'tickets';
    try {
      let imageUrl = '';
      if (file) {
        const storageRef = ref(storage, `tickets/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Save ticket to Firestore
      await addDoc(collection(db, 'tickets'), {
        uid: user.uid,
        username: profile.username,
        userEmail: user.email,
        title: formData.title,
        subject: formData.subject,
        description: formData.description,
        imageUrl,
        status: 'open',
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      toast.success('Ticket submitted successfully!');
    } catch (error: any) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
        <Navbar />
        <main className="pt-32 pb-20 px-4 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center space-y-6"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter italic uppercase">Ticket Received</h1>
            <p className="text-zinc-400">
              Your support ticket has been submitted. Our team will review it and get back to you as soon as possible.
            </p>
            <Button 
              onClick={() => setSubmitted(false)}
              className="bg-white text-black hover:bg-zinc-200 rounded-2xl h-12 px-8 font-bold uppercase tracking-widest"
            >
              Submit Another Ticket
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest"
            >
              <LifeBuoy className="w-3 h-3" />
              Support Center
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none"
            >
              How can we <span className="text-purple-500">help?</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 max-w-xl mx-auto text-lg"
            >
              Encountered an issue or have a suggestion? Submit a ticket and our support team will assist you.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-zinc-800">
                <CardTitle className="text-2xl font-black italic uppercase tracking-tight">Create Support Ticket</CardTitle>
                <CardDescription className="text-zinc-500">Provide as much detail as possible so we can help you faster.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-widest text-zinc-500">Subject</Label>
                      <Select onValueChange={(value: string) => setFormData({ ...formData, subject: value })}>
                        <SelectTrigger className="bg-black/50 border-zinc-800 rounded-xl h-12 focus:ring-purple-500">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                          <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                          <SelectItem value="Account Problem">Account Problem</SelectItem>
                          <SelectItem value="Matchmaking Error">Matchmaking Error</SelectItem>
                          <SelectItem value="Report Player">Report Player</SelectItem>
                          <SelectItem value="Suggestion">Suggestion</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-zinc-500">Ticket Title</Label>
                      <Input 
                        id="title"
                        placeholder="Brief summary of the issue"
                        className="bg-black/50 border-zinc-800 rounded-xl h-12 focus:ring-purple-500"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-zinc-500">Description</Label>
                    <Textarea 
                      id="description"
                      placeholder="Describe your issue in detail..."
                      className="bg-black/50 border-zinc-800 rounded-2xl min-h-[150px] focus:ring-purple-500 resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Attach Image (Optional)</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <input
                          type="file"
                          id="image-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <Label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                        >
                          {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <>
                              <ImageIcon className="w-6 h-6 text-zinc-600 group-hover:text-purple-500 transition-colors" />
                              <span className="text-[10px] font-bold uppercase mt-2 text-zinc-600 group-hover:text-purple-500">Upload</span>
                            </>
                          )}
                        </Label>
                      </div>
                      <div className="flex-1 text-xs text-zinc-500">
                        <p>Upload a screenshot of the issue.</p>
                        <p>Max size: 5MB. Formats: JPG, PNG.</p>
                        {file && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 rounded-lg"
                            onClick={() => { setFile(null); setPreview(null); }}
                          >
                            Remove Image
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Submit Ticket <Send className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
