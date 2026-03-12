import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiChevronLeft, FiSend } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const helpTopics = [
  {
    id: 'file-complaint',
    label: 'How to file a complaint',
    answer:
      'To file a complaint, log in to your GrievX account and navigate to "Report Issue" from the dashboard or the Services menu. Fill in the details, attach photos if needed, and submit. Our AI will automatically classify and route it to the right department.',
  },
  {
    id: 'track-complaint',
    label: 'How to track a complaint',
    answer:
      'After submitting a complaint, go to "My Complaints" in the citizen dashboard. You\'ll see a list of all your submissions with real-time status updates and a timeline of actions taken.',
  },
  {
    id: 'otp-issue',
    label: 'OTP not received',
    answer:
      'If you haven\'t received your OTP, please check your spam/junk folder. Ensure the email address you registered with is correct. You can request a new OTP after 60 seconds. If the issue persists, contact support at support@grievx.gov.',
  },
  {
    id: 'login-problem',
    label: 'Login problem',
    answer:
      'If you\'re unable to log in, verify your email and password are correct. Use the "Forgot Password" link to reset your password. Clear your browser cache if the issue continues. For persistent issues, reach out to our helpline.',
  },
  {
    id: 'status-meaning',
    label: 'Complaint status meanings',
    answer:
      '• Pending — Your complaint has been received and is awaiting review.\n• In Progress — The assigned department is actively working on it.\n• Resolved — The issue has been addressed and closed.\n• Rejected — The complaint could not be actioned; a reason is provided in the details.',
  },
  {
    id: 'complaint-rejected',
    label: 'Why was my complaint rejected?',
    answer:
      'Complaints may be rejected if they are duplicate, out of jurisdiction, lack sufficient detail, or don\'t fall under civic issues. Check the rejection reason in your complaint details. You can file a new, more detailed complaint if needed.',
  },
  {
    id: 'contact-support',
    label: 'Contact support',
    answer:
      'You can reach us at:\n• Email: support@grievx.gov\n• Helpline: 1800-XXX-XXXX (24/7)\n• Or use the "Contact Support" link in the FAQ section of the website.',
  },
];

const HelpChatbot = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! How can I help you today? Choose a topic below.' },
  ]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Allow external triggers (e.g. footer Help Center link)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openHelpChatbot', handleOpen);
    return () => window.removeEventListener('openHelpChatbot', handleOpen);
  }, []);

  const handleTopicClick = (topic) => {
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: topic.label },
      { from: 'bot', text: topic.answer },
    ]);
    setSelectedTopic(topic.id);
  };

  const handleBack = () => {
    setMessages((prev) => [
      ...prev,
      { from: 'bot', text: 'What else can I help you with?' },
    ]);
    setSelectedTopic(null);
  };

  const handleReset = () => {
    setMessages([
      { from: 'bot', text: 'Hello! How can I help you today? Choose a topic below.' },
    ]);
    setSelectedTopic(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      <div
        className={`
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}
          w-[340px] sm:w-[380px] max-h-[480px] rounded-2xl shadow-2xl overflow-hidden flex flex-col
          ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
              🏛️
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">GrievX Help</p>
              <p className="text-[11px] text-blue-100">Civic Support Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition"
            aria-label="Close chatbot"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar min-h-0"
          style={{ maxHeight: '290px' }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-line leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : isDark
                    ? 'bg-gray-700 text-gray-200 rounded-bl-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Options / Actions */}
        <div className={`flex-shrink-0 border-t px-4 py-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {selectedTopic ? (
            <div className="flex gap-2">
              <button
                onClick={handleBack}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition
                  ${isDark
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <FiChevronLeft className="w-4 h-4" />
                More topics
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Start over
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {helpTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition
                    ${isDark
                      ? 'bg-gray-700 text-blue-300 hover:bg-gray-600 hover:text-blue-200'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300
          ${isOpen
            ? 'bg-gray-600 hover:bg-gray-700 rotate-90'
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-110'
          }
          text-white
        `}
        aria-label={isOpen ? 'Close help chat' : 'Open help chat'}
      >
        {isOpen ? (
          <FiX className="w-6 h-6" />
        ) : (
          <FiMessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default HelpChatbot;
