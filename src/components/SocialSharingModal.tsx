
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Facebook, Twitter, MessageCircle, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareComplete: () => void;
}

const SocialSharingModal = ({ isOpen, onClose, onShareComplete }: SocialSharingModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareText = "I'm practicing for the Japanese driving test with this amazing quiz app! 🚗📚 #DrivingTest #Japan";
  const shareUrl = window.location.origin;

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      '_blank',
      'width=600,height=400'
    );
    handleShareComplete();
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
    handleShareComplete();
  };

  const handleLineShare = () => {
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank',
      'width=600,height=400'
    );
    handleShareComplete();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "Please share it on your social media!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleShareComplete = () => {
    toast({
      title: "Thank you for sharing!",
      description: "All questions have been unlocked 🎉",
    });
    onShareComplete();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Share on Social Media to Unlock All Questions</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-blue-800 mb-2">
                Share on social media to unlock the remaining 100 questions!
              </p>
              <p className="text-xs text-blue-600">
                (Questions beyond 50 are normally premium, but sharing unlocks them for free!)
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleFacebookShare}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>

            <Button
              onClick={handleTwitterShare}
              className="bg-sky-500 hover:bg-sky-600 text-white"
              size="lg"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>

            <Button
              onClick={handleLineShare}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="lg"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              LINE
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="lg"
              className="border-gray-300"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>

          <div className="text-center">
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-gray-500"
            >
              Share Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialSharingModal;
