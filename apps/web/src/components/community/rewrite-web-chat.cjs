const fs = require('fs');
const path = 'C:\\Users\\darik\\Downloads\\nuracare-v2\\apps\\web\\src\\components\\community\\ChallengesSection.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('const [chatMessages')) {
  // 1. Add state
  content = content.replace(/const \[isNuraGenerating, setIsNuraGenerating\] = useState\(false\);/, 
    `const [isNuraGenerating, setIsNuraGenerating] = useState(false);\n  const [chatMessages, setChatMessages] = useState([\n    { id: 'msg-0', sender: 'nura', text: "Hi! I'm Nura, your AI Architect. What kind of habit or challenge would you like to build today? I'll set up the anti-cheat sensors and pool rules automatically." }\n  ]);\n  const chatScrollRef = useRef(null);\n  const nuraTimeoutRef = useRef(null);\n\n  useEffect(() => { return () => { if (nuraTimeoutRef.current) clearTimeout(nuraTimeoutRef.current); } }, []);\n  useEffect(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, [chatMessages, isNuraGenerating]);`);
  content = content.replace(/import React, \{ useState, useEffect, useMemo \} from 'react';/, `import React, { useState, useEffect, useMemo, useRef } from 'react';`);
}

// 2. Rewrite handleGenerateWithNura
const handleGenStart = content.indexOf('const handleGenerateWithNura =');
const handleGenEnd = content.indexOf('  // 5. Calculate Progress', handleGenStart);

if (handleGenStart > 0 && handleGenEnd > 0) {
  const newHandleGen = `const handleGenerateWithNura = (promptText = '') => {
    const text = (promptText || nuraPrompt).trim();
    if (!text) return;
    
    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
    setNuraPrompt('');
    setIsNuraGenerating(true);

    nuraTimeoutRef.current = setTimeout(() => {
      let title = '100 Deep Squats Morning War';
      let category = 'physical';
      let verificationType = 'camera';
      let mode = '1v1';
      let durationDays = 14;
      let isMonetary = true;
      let entryFee = 100;
      let description = 'Camera-verified morning squat challenge with real-time pose estimation anti-cheat.';
      let imageUrl = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80';

      const lowerText = text.toLowerCase();
      if (lowerText.includes('step') || lowerText.includes('walk') || lowerText.includes('10k') || lowerText.includes('10,000')) {
        title = '10,000 Daily Steps Marathon';
        category = 'physical';
        verificationType = 'device';
        mode = 'solo';
        durationDays = 21;
        isMonetary = false;
        entryFee = 0;
        description = 'Daily step goal verified directly through pedometer sensor data with anti-tamper telemetry.';
        imageUrl = 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80';
      } else if (lowerText.includes('water') || lowerText.includes('hydration') || lowerText.includes('drink') || lowerText.includes('3l')) {
        title = '3L Pure Hydration Journey';
        category = 'lifestyle';
        verificationType = 'evidence';
        mode = 'solo';
        durationDays = 30;
        isMonetary = false;
        entryFee = 0;
        description = 'Daily hydration tracking verified by AI photo recognition of water bottles.';
        imageUrl = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80';
      }

      const generatedData = {
        id: \`gen-\${Date.now()}\`,
        title,
        description,
        category,
        verificationType,
        verificationStrength: verificationType === 'camera' ? 'biometric' : verificationType === 'device' ? 'device_telemetry' : 'photo_ai',
        mode,
        durationDays,
        isMonetary,
        entryFee,
        prizePool: isMonetary ? entryFee * 10 : 0,
        participantsCount: 1,
        creator: 'You',
        createdAt: new Date().toISOString(),
        imageUrl,
        isJoined: false,
      };

      setGeneratedChallenge(generatedData);
      
      setChatMessages(prev => [...prev, { 
        id: Date.now().toString() + 'n', 
        sender: 'nura', 
        text: "I've architected a verifiable blueprint for you! Take a look below. You can launch it immediately or edit the parameters.",
        isBlueprint: true,
        blueprintData: generatedData
      }]);
      setIsNuraGenerating(false);
    }, 1500);
  };

`;
  content = content.substring(0, handleGenStart) + newHandleGen + content.substring(handleGenEnd);
}

// 3. Replace Web Modal Body
const modalStart = content.indexOf('<div style={{ flex: 1, overflowY: \'auto\'');
const modalEnd = content.indexOf('</div>\n        </div>\n      )}', modalStart);

if (modalStart > 0 && modalEnd > 0) {
  const newModalBody = `<div style={{ flex: 1, overflowY: 'auto', padding: 24, paddingBottom: 40 }} ref={chatScrollRef}>
            {chatMessages.map(msg => (
              <div key={msg.id} style={{ marginBottom: 16, display: 'flex', flexDirection: msg.sender === 'nura' ? 'row' : 'row-reverse', gap: 12 }}>
                {msg.sender === 'nura' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icons.Sparkles size={16} color="#fff" />
                  </div>
                )}
                <div style={{ 
                  maxWidth: '85%', 
                  background: msg.sender === 'nura' ? 'var(--bg)' : 'var(--green)', 
                  padding: 14, 
                  borderRadius: 18, 
                  borderTopLeftRadius: msg.sender === 'nura' ? 4 : 18,
                  borderTopRightRadius: msg.sender === 'nura' ? 18 : 4
                }}>
                  <div style={{ color: msg.sender === 'nura' ? 'var(--text)' : '#fff', fontSize: 14, lineHeight: '1.5' }}>
                    {msg.text}
                  </div>
                  
                  {msg.isBlueprint && msg.blueprintData && (
                    <div style={{ border: '1px solid rgba(22, 163, 74, 0.3)', background: 'rgba(22, 163, 74, 0.04)', borderRadius: 16, padding: 16, marginTop: 12 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                        <img src={msg.blueprintData.imageUrl} alt={msg.blueprintData.title} style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase' }}>
                            {msg.blueprintData.category} • {msg.blueprintData.mode}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>{msg.blueprintData.title}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4, marginBottom: 14 }}>
                        {msg.blueprintData.description}
                      </p>
                      <button
                        onClick={() => {
                          if (onCreateChallenge) onCreateChallenge(msg.blueprintData);
                          setShowNuraAiModal(false);
                          setToastMessage(\`"\${msg.blueprintData.title}" is now active.\`);
                        }}
                        style={{ width: '100%', background: 'var(--green)', color: '#fff', border: 'none', padding: '10px 0', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}
                      >
                        Launch Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isNuraGenerating && (
              <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Sparkles size={16} color="#fff" />
                </div>
                <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 18, borderTopLeftRadius: 4 }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Analyzing parameters...</div>
                </div>
              </div>
            )}
          </div>
          
          <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--white)' }}>
            {!generatedChallenge && chatMessages.length === 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12 }}>
                {['100 Deep Squats War', '10,000 Daily Steps', '3L Pure Hydration'].map((item) => (
                  <button
                    key={item}
                    onClick={() => { setNuraPrompt(''); handleGenerateWithNura(item); }}
                    style={{ background: 'var(--bg)', border: 'none', padding: '8px 14px', borderRadius: 16, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 24, padding: '10px 16px', border: '1px solid var(--border)' }}>
                <input
                  type="text"
                  placeholder="Type your challenge idea..."
                  value={nuraPrompt}
                  onChange={(e) => setNuraPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateWithNura(); }}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: 'var(--text)' }}
                />
              </div>
              <button
                onClick={() => handleGenerateWithNura()}
                disabled={!nuraPrompt.trim() || isNuraGenerating}
                style={{ width: 44, height: 44, borderRadius: 22, background: nuraPrompt.trim() ? 'var(--green)' : 'var(--border)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: nuraPrompt.trim() ? 'pointer' : 'default' }}
              >
                <Icons.ArrowRight size={20} />
              </button>
            </div>
          </div>
`;
  content = content.substring(0, modalStart) + newModalBody + content.substring(modalEnd);
}

fs.writeFileSync(path, content);
console.log('done');
