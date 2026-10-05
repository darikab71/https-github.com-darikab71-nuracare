const fs = require('fs');
const path = 'C:\\Users\\darik\\Downloads\\nuracare-v2\\apps\\web\\src\\components\\community\\ChallengesSection.jsx';
let content = fs.readFileSync(path, 'utf8');

const searchRegex = /\{\/\* HIGH VISIBILITY SUBMIT AND NEXT BUTTON \*\/\}(?:.|\n)*?Launch Challenge\n\s*<\/button>\n\s*<\/div>/;

const replacement = `{/* HIGH VISIBILITY SUBMIT AND NEXT BUTTON */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--white)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: 14,
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)',
                  }}
                >
                  Launch Challenge
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setTimeout(() => setShowNuraAiModal(true), 150);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'rgba(22, 163, 74, 0.1)',
                  color: 'var(--green)',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                <Icons.Sparkles size={16} /> Create with Nura AI Chat
              </button>
            </div>`;

content = content.replace(searchRegex, replacement);
fs.writeFileSync(path, content);
console.log('done');
