import { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";

interface AvatarDisplayProps {
  isVoiceEnabled: boolean;
  currentMessage?: string;
  isAnimating?: boolean;
}

export default function AvatarDisplay({ 
  isVoiceEnabled, 
  currentMessage, 
  isAnimating = false 
}: AvatarDisplayProps) {
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);

  useEffect(() => {
    if (currentMessage && isVoiceEnabled) {
      setShowSpeechBubble(true);
      const timer = setTimeout(() => {
        setShowSpeechBubble(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentMessage, isVoiceEnabled]);

  return (
    <div className="relative">
      {/* Avatar Display */}
      <div className="avatar-container w-32 h-32 md:w-40 md:h-40">
        <img 
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300" 
          alt="AI Tutor Avatar" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Speech Bubble */}
      {showSpeechBubble && currentMessage && (
        <div className="speech-bubble absolute -top-2 -right-4 bg-white rounded-xl shadow-lg p-3 max-w-xs z-10">
          <div className="text-sm text-dark-text font-medium">
            {currentMessage}
          </div>
        </div>
      )}
      
      {/* Voice Indicator */}
      {isVoiceEnabled && (
        <div className={`absolute bottom-2 right-2 w-6 h-6 bg-success-green rounded-full flex items-center justify-center shadow-lg ${isAnimating ? 'voice-indicator' : ''}`}>
          <Volume2 className="text-white w-3 h-3" />
        </div>
      )}
    </div>
  );
}
