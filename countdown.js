const { useState, useEffect } = React;
// Initialiser Supabase klient
const supabaseUrl = 'https://lzsmdpziaanmixumdxjh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6c21kcHppYWFubWl4dW1keGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMDQzODYsImV4cCI6MjA1Njc4MDM4Nn0.vNa-Fp6cmPNl02gOxhGa_Aq5DDM6T4E1lO1_8Us4xb8';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Generer en unik bruker-ID for denne nettleseren hvis den ikke allerede eksisterer
const getUserId = () => {
  let userId = localStorage.getItem('japanTripUserId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('japanTripUserId', userId);
  }
  return userId;
};
// Generer en unik bruker-ID for denne nettleseren hvis den ikke allerede eksisterer
const getUserId = () => {
  let userId = localStorage.getItem('japanTripUserId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('japanTripUserId', userId);
  }
  return userId;
};

const JapanCountdown = () => {
  // Set your Japan trip date here
  const [tripDate, setTripDate] = useState('2025-04-11');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [customMessage, setCustomMessage] = useState('');
  const [theme, setTheme] = useState('ninjamodus');
  const [blossoms, setBlossoms] = useState(Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * -100,
    size: Math.random() * 12 + 8,
    opacity: Math.random() * 0.5 + 0.3,
    speed: Math.random() * 2 + 1,
    wobble: Math.random() * 3 + 2,
    rotation: Math.random() * 360,
  })));
  const [ninjas, setNinjas] = useState(Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * -100,
    size: Math.random() * 16 + 12,
    opacity: Math.random() * 0.3 + 0.2,
    speed: Math.random() * 3 + 2,
    direction: Math.random() > 0.5 ? 1 : -1,
    rotation: Math.random() * 360,
    delay: Math.random() * 5,
  })));
  const [messageLog, setMessageLog] = useState([]);
  const [dailyMessagesCount, setDailyMessagesCount] = useState(0);
  
  // Theme options with Japanese-inspired designs
  const themes = {
    'cherry-blossom': {
      background: 'bg-pink-100',
      accent: 'bg-pink-500',
      textColor: 'text-pink-800',
      borderColor: 'border-pink-300',
      icon: '🌸',
      name: 'Kirsebærblomst'
    },
    'mount-fuji': {
      background: 'bg-blue-50',
      accent: 'bg-blue-600',
      textColor: 'text-blue-900',
      borderColor: 'border-blue-300',
      icon: '🗻',
      name: 'Fuji-fjellet'
    },
    'shinkansen': {
      background: 'bg-gray-100',
      accent: 'bg-gray-600',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-400',
      icon: '🚄',
      name: 'Shinkansen'
    },
    'lantern': {
      background: 'bg-red-100',
      accent: 'bg-red-600',
      textColor: 'text-red-900',
      borderColor: 'border-red-300',
      icon: '🏮',
      name: 'Lanterne'
    },
    'ninjamodus': {
      background: 'bg-gray-900',
      accent: 'bg-indigo-600',
      textColor: 'text-white',
      borderColor: 'border-gray-700',
      icon: '🌙',
      name: 'Ninjamodus'
    }
  };

  // Update ninja animations
  useEffect(() => {
    const animationFrame = setInterval(() => {
      setNinjas(prevNinjas => 
        prevNinjas.map(ninja => {
          // Make ninjas move diagonally and disappear/reappear more ninja-like
          let newTop = ninja.top + ninja.speed;
          let newLeft = ninja.left + (ninja.direction * ninja.speed * 0.7);
          
          // Ninjas move in quick bursts with pauses
          const moveNow = (Date.now() / 1000) % 10 > ninja.delay;
          
          if (moveNow) {
            // If ninja is out of bounds, teleport to a new random position
            if (newTop > 120 || newLeft < -10 || newLeft > 110) {
              newTop = Math.random() * -30 - 10; // Start above the viewport
              newLeft = Math.random() * 100;
              return {
                ...ninja,
                top: newTop,
                left: newLeft,
                direction: Math.random() > 0.5 ? 1 : -1,
                speed: Math.random() * 3 + 2,
              };
            }
            
            return {
              ...ninja,
              top: newTop,
              left: newLeft,
              rotation: ninja.rotation + (ninja.direction * 5),
            };
          }
          
          return ninja;
        })
      );
    }, 50);

    return () => clearInterval(animationFrame);
  }, []);

  // Update falling cherry blossoms
  useEffect(() => {
    const animationFrame = setInterval(() => {
      setBlossoms(prevBlossoms => 
        prevBlossoms.map(blossom => {
          let newTop = blossom.top + blossom.speed;
          let newLeft = blossom.left + Math.sin(newTop / 50) * 0.5;
          
          if (newTop > 120) {
            newTop = -10;
            newLeft = Math.random() * 100;
          }
          
          return {
            ...blossom,
            top: newTop,
            left: newLeft,
            rotation: blossom.rotation + 0.5,
          };
        })
      );
    }, 50);

    return () => clearInterval(animationFrame);
  }, []);

// Load saved message log from Supabase on initial render
useEffect(() => {
  const loadMessages = async () => {
    try {
      // Hent meldinger fra Supabase
      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        setMessageLog(data);
        
        // Sjekk antall meldinger fra dagens bruker
        const today = new Date().toLocaleDateString();
        const userId = getUserId();
        const todaysMessages = data.filter(entry => 
          entry.date === today && entry.user_id === userId
        );
        setDailyMessagesCount(todaysMessages.length);
      }
    } catch (e) {
      console.error('Error loading message log:', e);
      // Fallback til localStorage hvis Supabase feiler
      try {
        const savedLog = localStorage.getItem('japanTripMessageLog');
        if (savedLog) {
          const parsedLog = JSON.parse(savedLog);
          setMessageLog(parsedLog);
          
          const today = new Date().toLocaleDateString();
          const userId = getUserId();
          const todaysMessages = parsedLog.filter(entry => 
            entry.date === today && entry.user_id === userId
          );
          setDailyMessagesCount(todaysMessages.length);
        }
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    }
  };

  loadMessages();
}, []);

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const tripTime = new Date(tripDate);
      
      if (isNaN(tripTime.getTime())) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const difference = tripTime - now;
      
      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setCustomMessage("Du er i Japan! 🎉");
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };
    
    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    
    return () => clearInterval(timer);
  }, [tripDate]);

  // Fun facts about Japan in Norwegian with emojis
  const japanFacts = [
    "Japan har over 5 millioner salgsautomater - den høyeste tettheten i verden! 🤖",
    "Det er mer enn 200 vulkaner i Japan, hvorav 108 fortsatt er aktive. 🌋",
    "Verdens eldste selskap er i Japan - Kongō Gumi ble grunnlagt i år 578. 🏯",
    "Å slurpe nudler i Japan er ikke uhøflig - det anses som et tegn på nytelse! 🍜",
    "Japan har over 1500 jordskjelv hvert år. 📳",
    "Det japanske hurtigtoget (Shinkansen) har aldri hatt en dødsulykke i sin historie. 🚅",
    "Japan består av 6852 øyer. 🏝️",
    "Å bukke i Japan har 15 forskjellige varianter avhengig av kontekst. 🙇",
    "Kit Kat er ekstremt populært i Japan med over 300 forskjellige smaker lansert siden 2000. 🍫",
    "Japanske tog er i gjennomsnitt forsinket med bare 7 sekunder. ⏱️",
    "Det finnes over 200 arter av kirsebærtrær i Japan. 🌸",
    "Sumo er Japans nasjonale sport, med tradisjoner som går tilbake 1500 år. 🏆",
    "Japansk er et av de raskeste talte språkene i verden. 🗣️",
    "Takeshita Street i Tokyo er så trang at to personer knapt kan gå ved siden av hverandre. 🛣️",
    "I Japan er det vanlig å ta en 'inemuri' - en kort blund på jobb for å vise hvor hardt du jobber. 😴"
  ];
  
  // Get countdown emoji based on days remaining
  const getCountdownEmoji = (days) => {
    if (days <= 0) return "🎉🎉";
    else if (days === 1) return "🤩🤩";
    else if (days === 2) return "🥵";
    else if (days === 3) return "😱";
    else if (days <= 10) return "🥹";
    else if (days <= 20) return "🤓";
    else return "🫠";
  };
  
  // Use state to store the current fact and only change it every hour
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  
  useEffect(() => {
    // Set initial random fact
    setCurrentFactIndex(Math.floor(Math.random() * japanFacts.length));
    
    // Check how many messages we've logged today
    const checkDailyMessageCount = () => {
      const today = new Date().toLocaleDateString();
      const todaysMessages = messageLog.filter(entry => entry.date === today);
      setDailyMessagesCount(todaysMessages.length);
    };
    
    checkDailyMessageCount();
    
    // Change fact every hour (3600000 milliseconds)
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prevIndex => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * japanFacts.length);
        } while (newIndex === prevIndex); // Ensure we get a different fact
        return newIndex;
      });
    }, 3600000);
    
    return () => clearInterval(factInterval);
  }, [messageLog]);
  
  const randomFact = japanFacts[currentFactIndex];
  
  const currentTheme = themes[theme];
  
  // Calculate countdown completion percentage
  const calculateProgress = () => {
    const now = new Date();
    const tripTime = new Date(tripDate);
    
    if (isNaN(tripTime.getTime())) {
      return 0;
    }
    
    // Assuming we start tracking 100 days before the trip
    const totalDuration = 100 * 24 * 60 * 60 * 1000; // 100 days in ms
    const elapsed = totalDuration - (tripTime - now);
    
    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;
    
    return (elapsed / totalDuration) * 100;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Cherry blossom animations - always visible but only pink when theme is cherry-blossom */}
      {blossoms.map(blossom => (
        <div 
          key={blossom.id} 
          className="absolute pointer-events-none z-0"
          style={{
            left: `${blossom.left}%`,
            top: `${blossom.top}%`,
            width: `${blossom.size}px`,
            height: `${blossom.size}px`,
            opacity: theme === 'cherry-blossom' ? blossom.opacity : 0.1,
            transform: `rotate(${blossom.rotation}deg)`,
            transition: 'opacity 0.5s ease',
          }}
        >
          <div className={`w-full h-full ${theme === 'cherry-blossom' ? 'bg-pink-300' : 'bg-gray-200'} rounded-full transition-colors duration-500`}></div>
          <div className={`absolute inset-0 ${theme === 'cherry-blossom' ? 'bg-pink-200' : 'bg-gray-100'} rounded-full transition-colors duration-500`} 
               style={{clipPath: 'polygon(50% 0%, 80% 50%, 50% 100%, 20% 50%)'}}></div>
        </div>
      ))}
      
      {/* Ninja animations - visible when ninjamodus is active */}
      {ninjas.map(ninja => (
        <div 
          key={ninja.id} 
          className="absolute pointer-events-none z-0"
          style={{
            left: `${ninja.left}%`,
            top: `${ninja.top}%`,
            opacity: theme === 'ninjamodus' ? ninja.opacity : 0,
            transform: `rotate(${ninja.rotation}deg)`,
            transition: 'opacity 0.3s ease',
            fontSize: `${ninja.size}px`,
          }}
        >
          🥷
        </div>
      ))}
      
      <div className={`w-full max-w-lg mx-auto p-6 rounded-lg shadow-lg ${currentTheme.background} ${currentTheme.borderColor} border-2 relative z-10`}>
        <div className="text-center mb-6">
          <h2 className={`text-3xl font-bold mb-2 ${currentTheme.textColor} flex items-center justify-center`}>
            <span className="mr-2">{theme === 'ninjamodus' ? '🌙' : currentTheme.icon}</span>
            Nedteller til japanreisa
            <span className="ml-2">{theme === 'ninjamodus' ? '🌙' : currentTheme.icon}</span>
          </h2>
          
          <div className="mb-4">
            <label className={`block ${currentTheme.textColor} mb-1 font-medium`}>
              Reisedato:
            </label>
            <input
              type="date"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
              className={`px-3 py-2 border rounded w-full text-center ${theme === 'ninjamodus' ? 'bg-gray-800 text-white border-gray-700' : ''}`}
            />
          </div>
          
          <div className="mb-4">
            <label className={`block ${currentTheme.textColor} mb-1 font-medium`}>
              Fargetema:
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.keys(themes).map(themeName => (
                <button
                  key={themeName}
                  onClick={() => setTheme(themeName)}
                  className={`px-3 py-1 rounded ${
                    theme === themeName 
                      ? currentTheme.accent + ' text-white' 
                      : theme === 'ninjamodus' 
                        ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                        : 'bg-white ' + themes[themeName].textColor
                  }`}
                >
                  {themes[themeName].icon} {themes[themeName].name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${currentTheme.accent}`}
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
        
        {/* Countdown display */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            {unit: 'days', label: 'dager'}, 
            {unit: 'hours', label: 'timer'}, 
            {unit: 'minutes', label: 'minutter'}, 
            {unit: 'seconds', label: 'sekunder'}
          ].map(({unit, label}) => (
            <div key={unit} className="text-center">
              <div className={`${currentTheme.accent} rounded-lg p-3 text-white text-2xl font-bold`}>
                {unit === 'days' && (
                  <div className="flex items-center justify-center">
                    <span className="mr-1">{getCountdownEmoji(countdown.days)}</span>
                    {countdown[unit]}
                  </div>
                )}
                {unit !== 'days' && countdown[unit]}
              </div>
              <div className={`${currentTheme.textColor} mt-1`}>
                {label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Custom message and log section */}
        <div className={`mt-6 rounded-lg p-4 shadow-inner ${theme === 'ninjamodus' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="mb-3">
            <label className={`block ${currentTheme.textColor} mb-1 font-medium`}>
              Personlig melding:
            </label>
            <div className="flex">
              <input
                type="text"
                placeholder="Legg til din personlige nedtellingsmelding"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className={`px-3 py-2 border rounded flex-grow ${theme === 'ninjamodus' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
              />
<button 
  onClick={() => {
    if (customMessage.trim()) {
      const today = new Date().toLocaleDateString();
      const newEntry = {
        message: customMessage,
        date: today,
        timestamp: new Date().toISOString()
      };
      setMessageLog(prev => [newEntry, ...prev.slice(0, 19)]);
      setCustomMessage('');
      setDailyMessagesCount(prev => prev + 1);
      
      // Store in localStorage
      try {
        const updatedLog = [newEntry, ...(JSON.parse(localStorage.getItem('japanTripMessageLog') || '[]')).slice(0, 19)];
        localStorage.setItem('japanTripMessageLog', JSON.stringify(updatedLog));
      } catch (e) {
        console.error('Could not save to localStorage', e);
      }
    }
  }}
  disabled={dailyMessagesCount >= 3}
  className={`ml-2 px-4 py-2 rounded ${
    dailyMessagesCount >= 3
      ? 'bg-gray-300 cursor-not-allowed' 
      : `${currentTheme.accent} text-white hover:opacity-90`
  }`}
>
  Lagre
</button>
            </div>
            {dailyMessagesCount >= 3 ? (
              <p className={`text-sm text-yellow-500 mt-1 ${theme === 'ninjamodus' ? 'text-yellow-300' : ''}`}>
                Du har nådd dagskvoten på 3 meldinger. Prøv igjen i morgen! 😎
              </p>
            ) : (
              <p className={`text-sm ${theme === 'ninjamodus' ? 'text-blue-300' : 'text-blue-500'} mt-1`}>
                Du har skrevet {dailyMessagesCount}/3 meldinger tillatt i dag 😎
              </p>
            )}
          </div>
          
          <div className={`${currentTheme.textColor} mt-4 text-center italic border-t pt-3 ${theme === 'ninjamodus' ? 'border-gray-700' : ''}`}>
            <p className="font-medium">Japan funfacts:</p>
            <p>{randomFact}</p>
          </div>
          
          {/* Message log section */}
          {messageLog.length > 0 && (
            <div className={`mt-4 pt-3 border-t ${theme === 'ninjamodus' ? 'border-gray-700' : ''}`}>
              <h3 className={`${currentTheme.textColor} font-medium`}>Meldingslogg:</h3>
              <div className={`mt-2 max-h-40 overflow-y-auto ${theme === 'ninjamodus' ? 'scrollbar-thin scrollbar-thumb-gray-700' : 'scrollbar-thin'}`}>
                {messageLog.map((entry, idx) => (
                  <div key={entry.timestamp || idx} className={`mb-2 p-2 rounded ${theme === 'ninjamodus' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`${currentTheme.textColor} text-sm`}>{entry.message}</p>
                    <p className={`text-xs mt-1 ${theme === 'ninjamodus' ? 'text-gray-400' : 'text-gray-500'}`}>{entry.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Render the component
ReactDOM.render(
  <JapanCountdown />,
  document.getElementById('root')
);