import { useState, useRef, useEffect } from 'react';
import { MessageSquare, MapPin, AlertTriangle, Phone, Clock, User, Bot, Send, Loader2, Navigation, Stethoscope, Heart, Shield, Zap, Star, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  severity?: 'normal' | 'warning' | 'severe';
}

interface Location {
  lat: number;
  lon: number;
  city: string;
  country: string;
  address: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Welcome to MedAssist AI! 👋 I\'m your advanced medical consultation assistant. I can help analyze your symptoms, recommend specialists, and find nearby healthcare facilities. Let\'s start by detecting your location for personalized care recommendations.',
      timestamp: new Date(),
      severity: 'normal'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(true);
  const [cityInput, setCityInput] = useState('');
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'bot' | 'system', content: string, severity: 'normal' | 'warning' | 'severe' = 'normal') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      severity
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const changeLocation = () => {
    setLocation(null);
    setShowLocationInput(true);
    setShowLocationSettings(false);
    setCityInput('');
    addMessage('system', '📍 Location reset. Please set your location again for personalized care.', 'normal');
  };

  const detectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    
    if (!navigator.geolocation) {
      addMessage('system', '❌ Geolocation is not supported by this browser. Please enter your city manually.', 'warning');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get location details
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          const detectedLocation: Location = {
            lat: latitude,
            lon: longitude,
            city: data.city || data.locality || 'Unknown City',
            country: data.countryName || 'Unknown Country',
            address: `${data.city || data.locality}, ${data.principalSubdivision}, ${data.countryName}`
          };
          
          setLocation(detectedLocation);
          setShowLocationInput(false);
          addMessage('system', `📍 Location detected successfully: ${detectedLocation.address}`, 'normal');
          addMessage('bot', `Perfect! Now I can provide you with personalized medical guidance and help you find nearby healthcare facilities in ${detectedLocation.city}. Please describe your symptoms or health concerns.`, 'normal');
          
        } catch (error) {
          addMessage('system', '❌ Could not retrieve location details. Please enter your city manually.', 'warning');
        }
        
        setIsDetectingLocation(false);
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '❌ Location access denied. Please enable location permissions or enter your city manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '❌ Location information unavailable. Please enter your city manually.';
            break;
          case error.TIMEOUT:
            errorMessage = '❌ Location request timed out. Please enter your city manually.';
            break;
          default:
            errorMessage = '❌ An unknown error occurred. Please enter your city manually.';
            break;
        }
        addMessage('system', errorMessage, 'warning');
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleLocationSubmit = async () => {
    if (!cityInput.trim()) return;
    
    try {
      // Use geocoding to get coordinates from city name
      const response = await fetch(
        `https://api.bigdatacloud.net/data/forward-geocode?query=${encodeURIComponent(cityInput)}&key=bdc_c8b4b3c4c4b44f8b9c4b4b3c4c4b44f8`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const manualLocation: Location = {
          lat: result.latitude,
          lon: result.longitude,
          city: result.city || cityInput,
          country: result.country || 'Unknown Country',
          address: `${result.city || cityInput}, ${result.adminArea1 || ''}, ${result.country || ''}`
        };
        
        setLocation(manualLocation);
        setShowLocationInput(false);
        addMessage('system', `📍 Location set to: ${manualLocation.address}`, 'normal');
        addMessage('bot', `Great! I've set your location to ${manualLocation.city}. Now I can provide personalized medical guidance and help you find nearby healthcare facilities. Please describe your symptoms or health concerns.`, 'normal');
      } else {
        // Fallback with mock coordinates
        const fallbackLocation: Location = {
          lat: 40.7128,
          lon: -74.0060,
          city: cityInput,
          country: 'Unknown',
          address: cityInput
        };
        
        setLocation(fallbackLocation);
        setShowLocationInput(false);
        addMessage('system', `📍 Location set to: ${cityInput} (approximate coordinates)`, 'normal');
        addMessage('bot', `I've set your location to ${cityInput}. Now you can describe your symptoms and I'll help you find the right care.`, 'normal');
      }
      
      setCityInput('');
    } catch (error) {
      addMessage('system', '❌ Could not process location. Please try again.', 'warning');
    }
  };

  const getSpecializationFromAI = async (symptoms: string): Promise<string> => {
    // Enhanced AI specialization detection with more comprehensive mapping
    const symptomLower = symptoms.toLowerCase();
    
    // Cardiovascular
    if (symptomLower.includes('chest pain') || symptomLower.includes('heart') || 
        symptomLower.includes('palpitation') || symptomLower.includes('cardiac')) return 'Cardiology';
    
    // Respiratory
    if (symptomLower.includes('breathing') || symptomLower.includes('lung') || 
        symptomLower.includes('cough') || symptomLower.includes('asthma')) return 'Pulmonology';
    
    // Neurological
    if (symptomLower.includes('headache') || symptomLower.includes('brain') || 
        symptomLower.includes('seizure') || symptomLower.includes('stroke')) return 'Neurology';
    
    // Ophthalmology
    if (symptomLower.includes('eye') || symptomLower.includes('vision') || 
        symptomLower.includes('sight')) return 'Ophthalmology';
    
    // ENT
    if (symptomLower.includes('ear') || symptomLower.includes('throat') || 
        symptomLower.includes('nose') || symptomLower.includes('hearing')) return 'ENT (Ear, Nose, Throat)';
    
    // Dermatology
    if (symptomLower.includes('skin') || symptomLower.includes('rash') || 
        symptomLower.includes('acne') || symptomLower.includes('eczema')) return 'Dermatology';
    
    // Orthopedics
    if (symptomLower.includes('bone') || symptomLower.includes('joint') || 
        symptomLower.includes('muscle') || symptomLower.includes('fracture')) return 'Orthopedics';
    
    // Gastroenterology
    if (symptomLower.includes('stomach') || symptomLower.includes('digestive') || 
        symptomLower.includes('nausea') || symptomLower.includes('abdomen')) return 'Gastroenterology';
    
    // Dentistry
    if (symptomLower.includes('tooth') || symptomLower.includes('dental') || 
        symptomLower.includes('gum') || symptomLower.includes('mouth')) return 'Dentistry';
    
    return 'General Medicine';
  };

  const isIllnessMoreThan4Days = (input: string): boolean => {
    const match = input.toLowerCase().match(/(\d+)\s*day/);
    return match ? parseInt(match[1]) >= 4 : false;
  };

  const isSevereSymptom = (input: string): boolean => {
    const severeKeywords = [
      'chest pain', 'shortness of breath', 'difficulty breathing',
      'fainting', 'loss of vision', 'severe headache', 'severe pain',
      'bleeding', 'seizure', 'unconscious', 'stroke', 'heart attack',
      'can\'t breathe', 'choking', 'severe bleeding', 'paralysis'
    ];
    const text = input.toLowerCase();
    return severeKeywords.some(keyword => text.includes(keyword));
  };

  const getHospitalSearchUrl = (specialization: string): string => {
    if (!location) return '';
    return `https://www.google.com/maps/search/${encodeURIComponent(specialization)}+hospital+near+${encodeURIComponent(location.city)}/@${location.lat},${location.lon},13z`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !location) return;
    
    const userMessage = inputValue.trim();
    addMessage('user', userMessage);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check for severe symptoms
    if (isSevereSymptom(userMessage)) {
      const specialization = await getSpecializationFromAI(userMessage);
      const hospitalUrl = getHospitalSearchUrl(specialization);
      
      addMessage('bot', `🚨 URGENT: Your symptoms indicate a potentially serious condition that requires immediate medical attention. Please visit an emergency room or call emergency services right away.`, 'severe');
      addMessage('system', `🏥 Recommended specialization: ${specialization}`, 'severe');
      addMessage('system', `📍 Find emergency ${specialization} care near you:`, 'severe');
      addMessage('system', `🔗 <a href="${hospitalUrl}" target="_blank" rel="noopener noreferrer" class="text-red-300 hover:text-red-200 underline font-medium">Open ${specialization} hospitals in Google Maps</a>`, 'severe');
      setIsTyping(false);
      return;
    }

    // Check for chronic symptoms (>4 days)
    if (isIllnessMoreThan4Days(userMessage)) {
      const specialization = await getSpecializationFromAI(userMessage);
      const hospitalUrl = getHospitalSearchUrl(specialization);
      
      addMessage('bot', `⚠️ Your symptoms have persisted for more than 4 days, which suggests you should schedule an appointment with a healthcare professional for proper evaluation and treatment.`, 'warning');
      addMessage('system', `🏥 Recommended specialization: ${specialization}`, 'warning');
      addMessage('system', `📍 Find ${specialization} specialists in ${location.city}:`, 'warning');
      addMessage('system', `🔗 <a href="${hospitalUrl}" target="_blank" rel="noopener noreferrer" class="text-yellow-300 hover:text-yellow-200 underline font-medium">Open ${specialization} specialists in Google Maps</a>`, 'warning');
      setIsTyping(false);
      return;
    }

    // Handle mild symptoms with comprehensive advice
    const advice = generateMedicalAdvice(userMessage);
    addMessage('bot', advice, 'normal');
    addMessage('system', `💡 Remember: This is general guidance only. Always consult healthcare professionals for personalized medical advice. If symptoms worsen or persist, seek professional care.`, 'normal');
    setIsTyping(false);
  };

  const generateMedicalAdvice = (symptoms: string): string => {
    const symptomLower = symptoms.toLowerCase();
    
    if (symptomLower.includes('headache')) {
      return `For mild headaches, try these approaches: Stay hydrated by drinking plenty of water, rest in a quiet, dark room, apply a cold or warm compress to your head or neck, and consider over-the-counter pain relievers like acetaminophen or ibuprofen. Ensure you're getting adequate sleep and managing stress levels.`;
    }
    
    if (symptomLower.includes('cough') || symptomLower.includes('cold')) {
      return `For mild cold symptoms and cough: Stay well-hydrated with warm liquids like herbal tea or warm water with honey, get plenty of rest, use a humidifier or breathe steam from a hot shower, and consider throat lozenges. Honey can be particularly soothing for coughs.`;
    }
    
    if (symptomLower.includes('fever')) {
      return `For mild fever: Rest and stay hydrated with plenty of fluids, dress in lightweight clothing, use a cool compress on your forehead, and consider acetaminophen or ibuprofen to reduce fever. Monitor your temperature regularly and seek medical care if fever exceeds 103°F (39.4°C).`;
    }
    
    if (symptomLower.includes('stomach') || symptomLower.includes('nausea')) {
      return `For mild stomach discomfort: Try the BRAT diet (bananas, rice, applesauce, toast), stay hydrated with small sips of clear fluids, avoid dairy and fatty foods, and consider ginger tea for nausea. Rest and avoid solid foods until you feel better.`;
    }
    
    return `Based on your symptoms, here are general recommendations: Ensure adequate rest and hydration, maintain a healthy diet, monitor your symptoms closely, and consider appropriate over-the-counter remedies if suitable. Create a comfortable environment for recovery and avoid strenuous activities.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showLocationInput) {
        handleLocationSubmit();
      } else {
        handleSendMessage();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-gray-900/95 to-slate-800/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-4 rounded-2xl shadow-lg">
                  <Stethoscope className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  MedAssist AI
                </h1>
                <p className="text-slate-300 font-medium text-lg">Advanced Medical Consultation Assistant</p>
              </div>
            </div>
            
            {location && (
              <div className="hidden md:flex items-center space-x-4 bg-gray-900/60 rounded-xl px-4 py-3 border border-gray-700/50 relative">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <div className="text-right mr-2">
                  <p className="text-white font-medium text-sm">{location.city}</p>
                  <p className="text-gray-400 text-xs">{location.country}</p>
                </div>
                <button
                  onClick={() => setShowLocationSettings(!showLocationSettings)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800/50"
                  title="Change location"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                
                {/* Location Settings Dropdown */}
                {showLocationSettings && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50">
                    <div className="p-4">
                      <h4 className="text-white font-medium mb-3">Location Settings</h4>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-300">
                          <p className="font-medium">Current: {location.city}</p>
                          <p className="text-xs text-gray-400">{location.address}</p>
                        </div>
                        <button
                          onClick={changeLocation}
                          className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors text-sm font-medium border border-blue-500/30"
                        >
                          Change Location
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-8">
        {/* Feature Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20 hover:border-red-400/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-red-500/15 p-3 rounded-xl">
                <Phone className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-bold text-white text-lg">Emergency</h3>
            </div>
            <p className="text-red-200/80 text-sm leading-relaxed">For life-threatening emergencies, call 911 immediately</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-emerald-500/15 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-lg">24/7 Available</h3>
            </div>
            <p className="text-emerald-200/80 text-sm leading-relaxed">Get medical guidance anytime, anywhere</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-purple-500/15 p-3 rounded-xl">
                <MapPin className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold text-white text-lg">Local Care</h3>
            </div>
            <p className="text-purple-200/80 text-sm leading-relaxed">Find hospitals and specialists in your area</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-500/15 p-3 rounded-xl">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-bold text-white text-lg">Change Location</h3>
            </div>
            <button
              onClick={changeLocation}
              className="text-blue-200/80 text-sm leading-relaxed hover:text-blue-100 transition-colors text-left"
            >
              Update your location for better healthcare recommendations
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-gray-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-800/50">
          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-8 bg-gradient-to-b from-gray-950/20 to-gray-900/20">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-l-2xl rounded-tr-2xl shadow-lg' 
                      : message.type === 'system'
                      ? message.severity === 'severe'
                        ? 'bg-gradient-to-r from-red-900/60 to-red-800/60 text-red-100 rounded-2xl border border-red-500/30 shadow-lg'
                        : message.severity === 'warning'
                        ? 'bg-gradient-to-r from-yellow-900/60 to-yellow-800/60 text-yellow-100 rounded-2xl border border-yellow-500/30 shadow-lg'
                        : 'bg-gradient-to-r from-gray-800/60 to-gray-700/60 text-gray-100 rounded-2xl border border-gray-600/30 shadow-lg'
                      : message.severity === 'severe'
                      ? 'bg-gradient-to-r from-red-900/40 to-red-800/40 text-red-100 rounded-r-2xl rounded-tl-2xl border border-red-500/30 shadow-lg'
                      : message.severity === 'warning'
                      ? 'bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 text-yellow-100 rounded-r-2xl rounded-tl-2xl border border-yellow-500/30 shadow-lg'
                      : 'bg-gradient-to-r from-gray-800/40 to-gray-700/40 text-gray-100 rounded-r-2xl rounded-tl-2xl border border-gray-600/30 shadow-lg'
                  } p-5 backdrop-blur-sm`}>
                    <div className="flex items-start space-x-3">
                      {message.type !== 'user' && (
                        <div className={`flex-shrink-0 ${
                          message.type === 'system' 
                            ? message.severity === 'severe' ? 'text-red-300' : message.severity === 'warning' ? 'text-yellow-300' : 'text-gray-300'
                            : message.severity === 'severe' ? 'text-red-300' : message.severity === 'warning' ? 'text-yellow-300' : 'text-blue-300'
                        }`}>
                          {message.type === 'system' ? (
                            message.severity === 'severe' ? (
                              <AlertTriangle className="w-5 h-5 mt-0.5" />
                            ) : (
                              <CheckCircle className="w-5 h-5 mt-0.5" />
                            )
                          ) : (
                            <Bot className="w-5 h-5 mt-0.5" />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: message.content }}></div>
                        <p className="text-xs mt-2 opacity-70">
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      {message.type === 'user' && (
                        <User className="w-5 h-5 mt-0.5 text-blue-200" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 text-gray-100 rounded-r-2xl rounded-tl-2xl border border-gray-600/30 p-5 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <Bot className="w-5 h-5 text-blue-300" />
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-5 h-5 text-blue-300 animate-spin" />
                        <span className="text-sm text-gray-200">Analyzing your symptoms...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-800/50 bg-gray-900/60 backdrop-blur-xl p-6">
            {showLocationInput ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-3 text-slate-300 mb-4">
                  <MapPin className="w-6 h-6" />
                  <span className="font-semibold text-lg">Set Your Location for Personalized Care</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={detectCurrentLocation}
                    disabled={isDetectingLocation}
                    className="flex-1 flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {isDetectingLocation ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Detecting Location...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-5 h-5" />
                        <span>Auto-Detect Location</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="text-gray-400 text-sm">OR</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>
                
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your city name..."
                    className="flex-1 px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-300"
                  />
                  <button
                    onClick={handleLocationSubmit}
                    disabled={!cityInput.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Set Location
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your symptoms in detail..."
                  className="flex-1 px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white placeholder-gray-500 backdrop-blur-sm transition-all duration-300"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-8 bg-gradient-to-r from-slate-900/40 to-gray-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-start space-x-4">
            <div className="bg-slate-600/20 p-3 rounded-xl">
              <Shield className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200 mb-3 text-xl">Important Medical Disclaimer</h4>
              <p className="text-slate-300/80 leading-relaxed">
                This AI assistant provides general health information and guidance only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with any questions about your medical condition. In case of emergency, call 911 immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;