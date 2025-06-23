import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Mic, MicOff, Volume2 } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@shared/schema";

interface ChatInterfaceProps {
  lessonId: number;
  userId: number;
  isVoiceEnabled: boolean;
}

export default function ChatInterface({ lessonId, userId, isVoiceEnabled }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { speak, speaking, cancel: cancelSpeech } = useSpeechSynthesis();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript, 
    supported: speechSupported 
  } = useSpeechRecognition();

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/users", userId, "lessons", lessonId, "messages"],
  });

  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", `/api/users/${userId}/lessons/${lessonId}/chat`, {
        message: messageText,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setMessage("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", userId, "lessons", lessonId, "messages"] 
      });
      
      // Speak AI response if voice is enabled
      if (isVoiceEnabled && data.aiMessage) {
        speak(data.aiMessage.message);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessage.mutate(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update message input with speech recognition transcript
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        sendMessage.mutate(transcript.trim());
        resetTranscript();
      }
    } else {
      resetTranscript();
      setMessage("");
      startListening();
    }
  };

  const handleStopSpeaking = () => {
    if (speaking) {
      cancelSpeech();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark-text flex items-center">
            <MessageCircle className="text-edu-blue mr-2 w-5 h-5" />
            Ask Your Tutor
          </h3>
          {isVoiceEnabled && speaking && (
            <Button
              onClick={handleStopSpeaking}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Volume2 className="w-4 h-4 mr-1" />
              Stop Speaking
            </Button>
          )}
        </div>
        
        {/* Chat Messages */}
        <div className="space-y-4 mb-4 max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-edu-blue"></div>
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isFromUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-sm rounded-lg p-3 ${
                    msg.isFromUser
                      ? "bg-edu-blue text-white"
                      : "bg-white text-dark-text border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <span className={`text-xs ${msg.isFromUser ? "text-blue-100" : "text-gray-500"}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : "Just now"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Start a conversation with your AI tutor!</p>
              <p className="text-sm">Ask questions about the lesson or request explanations.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="space-y-3">
          {isListening && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center text-red-600 mb-2">
                <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Listening... Speak now
              </div>
              <p className="text-sm text-gray-600">
                {transcript || "Say something and I'll type it for you"}
              </p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder={isListening ? "Listening..." : "Ask me anything about this lesson..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessage.isPending || isListening}
              className="flex-1"
            />
            
            {isVoiceEnabled && speechSupported && (
              <Button
                onClick={handleVoiceToggle}
                disabled={sendMessage.isPending}
                variant={isListening ? "destructive" : "outline"}
                className={isListening ? "text-white" : "text-gray-600 border-gray-300"}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Speak</span>
                  </>
                )}
              </Button>
            )}
            
            <Button 
              onClick={handleSendMessage}
              disabled={sendMessage.isPending || !message.trim() || isListening}
              className="bg-edu-blue hover:bg-blue-600 text-white"
            >
              {sendMessage.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Send</span>
                </>
              )}
            </Button>
          </div>
          
          {isVoiceEnabled && !speechSupported && (
            <p className="text-sm text-gray-500 text-center">
              Voice input not supported in this browser
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
