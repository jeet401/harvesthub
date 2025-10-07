import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { io } from 'socket.io-client';

const Chat = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // UI state for modals and notifications
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  // Helper function to show notifications
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        console.error('Failed to fetch conversations:', response.status);
        setConversations([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch messages:', response.status);
        setMessages([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]); // Set empty array as fallback
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL, {
      auth: { userId: user.id || user.sub || user.email, role: user.role }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('price_negotiation', async (message) => {
      console.log('💰 Price negotiation event received:', message);
      setMessages(prev => [...prev, message]);
      
      // Handle deal acceptance for buyers (auto add to cart)
      if (message.action === 'accept' && user.role === 'buyer') {
        console.log('🛒 Deal accepted by buyer - fetching conversation details...');
        
        try {
          // Try to use the currently selected conversation first
          let conversation = null;
          
          if (selectedConversation && selectedConversation._id === message.conversationId) {
            conversation = selectedConversation;
            console.log('✅ Using selected conversation for auto add to cart');
          } else {
            // Try to find it in the conversations array
            conversation = conversations.find(c => c._id === message.conversationId);
            if (conversation) {
              console.log('✅ Found conversation in local conversations array');
            } else {
              // Fetch as last resort with better error handling
              const response = await fetch(`${API_BASE}/chat/conversations`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
              });

              if (response.ok) {
                const data = await response.json();
                conversation = data.conversations?.find(c => c._id === message.conversationId);
                console.log('✅ Found conversation from server fetch');
              } else if (response.status === 401) {
                console.log('⚠️ Authentication expired, skipping auto add to cart');
                showNotification('error', '⚠️ Please refresh and try again - session expired');
                return;
              } else {
                console.log('❌ Failed to fetch conversations:', response.status);
                showNotification('error', '❌ Failed to load conversation details');
                return;
              }
            }
          }
            
            if (conversation && conversation.productId) {
              console.log('� Found conversation with product:', conversation.productId);
              
              // Auto add to cart with negotiated price
              const success = await addToCart(conversation.productId._id, 1, message.priceOffer);
              if (success) {
                console.log(`✅ Product automatically added to cart at agreed price: ₹${message.priceOffer}`);
                showNotification('success', `✅ Deal accepted! Product "${conversation.productId.title}" added to cart at ₹${message.priceOffer}`);
              } else {
                console.log('❌ Auto add to cart failed');
                showNotification('error', '❌ Failed to add product to cart');
              }
            } else {
              console.log('❌ Conversation or product not found');
              showNotification('error', '❌ Product information not found');
            }
        } catch (error) {
          console.error('Failed to automatically add product to cart:', error);
          showNotification('error', 'Error adding to cart: ' + error.message);
        }
      }

      // Update selected conversation if it matches
      if (message.action === 'accept' && selectedConversation && selectedConversation._id === message.conversationId) {
        setSelectedConversation(prev => ({
          ...prev,
          dealStatus: 'agreed',
          agreedPrice: message.priceOffer
        }));
      }
    });



    newSocket.on('userTyping', (data) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return [...filtered, { userId: data.userId, username: data.username }];
      });
    });

    newSocket.on('userStoppedTyping', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, SOCKET_URL]);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Join conversation room when selected
  useEffect(() => {
    if (socket && selectedConversation) {
      socket.emit('join_conversation', selectedConversation._id);
      fetchMessages(selectedConversation._id);
    }
  }, [socket, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!messageText.trim() || !socket || !selectedConversation) return;

    socket.emit('send_message', {
      conversationId: selectedConversation._id,
      text: messageText
    });

    setMessageText('');
    handleStopTyping();
  };

  const sendPriceOffer = (price) => {
    if (!socket || !selectedConversation || !price || isNaN(price)) return;

    socket.emit('send_message', {
      conversationId: selectedConversation._id,
      text: `Price offer: ₹${price}`,
      messageType: 'price_offer',
      priceOffer: parseFloat(price)
    });
    
    setShowOfferModal(false);
    setOfferPrice('');
    showNotification('success', `Price offer of ₹${price} sent successfully!`);
  };

  const acceptDeal = async () => {
    if (!socket || !selectedConversation) return;

    // Get the last price offer from messages
    const lastPriceOffer = messages
      .filter(m => m.messageType === 'price_offer' && m.priceOffer)
      .pop();
    
    if (lastPriceOffer) {
      socket.emit('negotiate_price', {
        conversationId: selectedConversation._id,
        newPrice: lastPriceOffer.priceOffer,
        action: 'accept'
      });
      console.log(`Deal accepted by ${user.role} for ₹${lastPriceOffer.priceOffer}`);
      showNotification('success', `✅ Deal accepted! Price agreed: ₹${lastPriceOffer.priceOffer}`);
    }
  };

  const rejectDeal = () => {
    if (!socket || !selectedConversation) return;

    // Get the last price offer from messages
    const lastPriceOffer = messages
      .filter(m => m.messageType === 'price_offer' && m.priceOffer)
      .pop();
    
    if (lastPriceOffer) {
      socket.emit('negotiate_price', {
        conversationId: selectedConversation._id,
        newPrice: lastPriceOffer.priceOffer,
        action: 'reject'
      });
      showNotification('info', `❌ Price offer of ₹${lastPriceOffer.priceOffer} rejected`);
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId: selectedConversation._id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping && socket && selectedConversation) {
      setIsTyping(false);
      socket.emit('stopTyping', { conversationId: selectedConversation._id });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p.userId._id !== user.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Conversations Sidebar */}
      <div className="w-1/3 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">Messages</h2>
        </div>
        
        <div className="overflow-y-auto h-full">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              return (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 ${
                    selectedConversation?._id === conversation._id ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">
                          {otherParticipant?.userId.email}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          otherParticipant?.role === 'farmer' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        } transition-colors duration-300`}>
                          {otherParticipant?.role}
                        </span>
                      </div>
                      
                      {conversation.productId && (
                        <p className="text-sm text-gray-600 mt-1">
                          {conversation.productId.title} - ₹{conversation.productId.price}
                        </p>
                      )}

                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {conversation.lastMessage.text}
                        </p>
                      )}

                      {conversation.dealStatus && conversation.dealStatus !== 'none' && (
                        <div className="mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            conversation.dealStatus === 'agreed' 
                              ? 'bg-green-100 text-green-800'
                              : conversation.dealStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Deal: {conversation.dealStatus}
                          </span>
                          {conversation.agreedPrice && (
                            <span className="ml-2 text-sm font-medium text-green-600">
                              ₹{conversation.agreedPrice}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(conversation.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                    {getOtherParticipant(selectedConversation)?.userId.email}
                  </h3>
                  {selectedConversation.productId && (
                    <p className="text-sm text-gray-600">
                      Discussing: {selectedConversation.productId.title} - ₹{selectedConversation.productId.price}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              {messages.map((message) => {
                const isOwn = message.senderId._id === user.id;
                return (
                  <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-colors duration-300 ${
                      isOwn 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-700'
                    }`}>
                      {message.messageType === 'price_offer' && (
                        <div className="mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isOwn ? 'bg-green-400 text-green-100' : 'bg-blue-100 text-blue-800'
                          }`}>
                            Price Offer
                          </span>
                        </div>
                      )}
                      
                      <p className="text-sm">{message.text}</p>
                      
                      {message.priceOffer && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className="font-semibold">Offered Price: ₹{message.priceOffer}</p>
                          {!isOwn && user.role === 'farmer' && message.messageType === 'price_offer' && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={acceptDeal}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={rejectDeal}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-gray-500'}`}>
                        {formatTimestamp(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
              {/* Make Offer Button for Buyers */}
              {selectedConversation.productId && user.role === 'buyer' && (
                <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    💰 Make Price Offer
                  </button>
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Price Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Make Price Offer</h3>
            
            {selectedConversation.productId && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">{selectedConversation.productId.title}</p>
                <p className="text-sm text-gray-600">Original Price: ₹{selectedConversation.productId.price}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Offer (₹)
              </label>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Enter your price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                step="1"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setOfferPrice('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => sendPriceOffer(offerPrice)}
                disabled={!offerPrice || isNaN(offerPrice) || offerPrice <= 0}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : notification.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {notification.type === 'success' ? '✅' : 
                 notification.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <p className="font-medium">{notification.message}</p>
              <button
                onClick={() => setNotification({ show: false, type: '', message: '' })}
                className="ml-2 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;