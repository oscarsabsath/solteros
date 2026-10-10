import { useState, useEffect, useRef } from 'react';

const QUESTIONS = [
  {
    id: 'intro',
    botMsg: '¡Hola y bendiciones! 👋 Soy tu Asistente con Propósito de Solteros Adventistas. Te haré 4 preguntas rápidas y redactaré una biografía atractiva que resalte tu fe y personalidad. Para empezar: ¿Cómo te llamas, qué edad tienes y en qué ciudad vives?',
    placeholder: 'Ej: Soy Samuel, tengo 28 años y vivo en Madrid',
    field: 'basicInfo',
  },
  {
    id: 'church',
    botMsg: '¡Encantado de conocerte! ⛪ Cuéntame sobre tu congregación: ¿En qué Iglesia Adventista te congregas y en qué ministerios te gusta participar (Conquistadores, música, diaconía, salud, etc.)?',
    placeholder: 'Ej: Me congrego en IASD Alenza y colaboro en el coro y en Conquistadores',
    field: 'churchInfo',
  },
  {
    id: 'lifestyle',
    botMsg: '¡Qué lindo ministerio! 🌿 ¿Cómo te gusta disfrutar el sábado y tu tiempo libre? ¿Cuáles son tus pasatiempos favoritos?',
    placeholder: 'Ej: Me encanta salir a la naturaleza los sábados, cocinar comida sana y leer',
    field: 'lifestyleInfo',
  },
  {
    id: 'purpose',
    botMsg: '¡Excelente! Última pregunta: ✨ ¿Qué valores, principios o metas espirituales buscas en una pareja para construir un noviazgo con propósito?',
    placeholder: 'Ej: Busco a alguien que ame a Dios, valore la familia y quiera servir juntos',
    field: 'purposeInfo',
  },
];

export default function AiProfileAssistant({ onProfileGenerated, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [answers, setAnswers] = useState({});
  const [generatedResult, setGeneratedResult] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: QUESTIONS[0].botMsg,
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!userInput.trim()) return;

    const currentQ = QUESTIONS[currentStep];
    const userText = userInput.trim();

    // Guardar respuesta
    const updatedAnswers = { ...answers, [currentQ.field]: userText };
    setAnswers(updatedAnswers);

    // Agregar mensaje del usuario
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setUserInput('');

    // Siguiente paso
    const nextStep = currentStep + 1;

    if (nextStep < QUESTIONS.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: QUESTIONS[nextStep].botMsg },
        ]);
        setCurrentStep(nextStep);
      }, 700);
    } else {
      // Finalizar y generar biografía con IA
      setIsTyping(true);
      setTimeout(() => {
        generateAiProfile(updatedAnswers);
        setIsTyping(false);
      }, 1200);
    }
  };

  const generateAiProfile = (allAnswers) => {
    const basic = allAnswers.basicInfo || '';
    const church = allAnswers.churchInfo || '';
    const lifestyle = allAnswers.lifestyleInfo || '';
    const purpose = allAnswers.purposeInfo || '';

    // Extracción inteligente de nombre y edad
    let name = '';
    let age = 25;
    let city = 'Madrid';
    let country = 'España';

    const words = basic.split(/[\s,]+/);
    if (words[0]) name = words[0].replace(/soy/i, '').trim();
    const ageMatch = basic.match(/\b(1[8-9]|[2-8][0-9])\b/);
    if (ageMatch) age = parseInt(ageMatch[0], 10);

    // Redacción de biografía inteligente y espiritual
    const bioText = `Miembro adventista comprometido con Dios y su obra. ${
      church ? `Me congrego activamente (${church}).` : ''
    } Disfruto de ${
      lifestyle ? `${lifestyle.toLowerCase()}` : 'la comunión con amigos y la naturaleza en sábado'
    }. En una relación valoro profundamente ${
      purpose ? `${purpose.toLowerCase()}` : 'el amor a Cristo, la sinceridad y construir un hogar con propósito'
    }.`;

    // Selección de intereses relevantes
    const detectedInterests = [];
    const textCorpus = (church + ' ' + lifestyle + ' ' + purpose).toLowerCase();

    if (textCorpus.includes('conquistador') || textCorpus.includes('guía')) {
      detectedInterests.push('Club de Conquistadores');
    }
    if (textCorpus.includes('música') || textCorpus.includes('canto') || textCorpus.includes('coro')) {
      detectedInterests.push('Música Sacra / Canto');
    }
    if (textCorpus.includes('salud') || textCorpus.includes('cocina') || textCorpus.includes('vegetariano')) {
      detectedInterests.push('Vida Saludable & Nutrición');
    }
    if (textCorpus.includes('naturaleza') || textCorpus.includes('senderismo') || textCorpus.includes('aire libre')) {
      detectedInterests.push('Senderismo en la Naturaleza');
    }
    if (textCorpus.includes('misión') || textCorpus.includes('voluntariado') || textCorpus.includes('servicio')) {
      detectedInterests.push('Misiones & Voluntariado');
    }
    if (textCorpus.includes('biblia') || textCorpus.includes('estudio') || textCorpus.includes('escuela sabática')) {
      detectedInterests.push('Estudio Bíblico Profundo');
    }
    if (detectedInterests.length === 0) {
      detectedInterests.push('Música Sacra / Canto', 'Vida Saludable & Nutrición', 'Senderismo en la Naturaleza');
    }

    const result = {
      fullName: name || 'Miembro Adventista',
      age: age,
      city: city,
      country: country,
      churchName: church.slice(0, 40) || 'IASD Central',
      bio: bioText,
      interests: detectedInterests.slice(0, 5),
    };

    setGeneratedResult(result);
  };

  const handleApply = () => {
    if (generatedResult) {
      onProfileGenerated(generatedResult);
    }
  };

  return (
    <div className="ai-assistant-wrapper">
      {/* CABECERA DEL ASISTENTE */}
      <div className="ai-assistant-header">
        <div className="ai-avatar-badge">
          <span>✨</span>
        </div>
        <div>
          <h4>Asistente con Propósito</h4>
          <span className="ai-status">Impulsado por Inteligencia Artificial</span>
        </div>
      </div>

      {/* RESULTADO GENERADO */}
      {generatedResult ? (
        <div className="ai-result-card">
          <div className="ai-sparkles-icon">🎉 ¡Perfil Generado con Éxito!</div>
          <p className="ai-result-desc">
            He redactado tu biografía y seleccionado tus intereses basados en lo que me compartiste:
          </p>

          <div className="ai-preview-box">
            <div className="ai-preview-header">
              <strong>{generatedResult.fullName}, {generatedResult.age}</strong>
              <span className="church-pill">⛪ {generatedResult.churchName}</span>
            </div>

            <p className="ai-bio-preview">"{generatedResult.bio}"</p>

            <div className="ai-interests-preview">
              {generatedResult.interests.map((tag, i) => (
                <span key={i} className="interest-pill">#{tag}</span>
              ))}
            </div>
          </div>

          <div className="ai-result-actions">
            <button
              type="button"
              className="primary-btn ai-apply-btn"
              onClick={handleApply}
            >
              ✓ Usar este perfil y subir fotos →
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setGeneratedResult(null);
                setCurrentStep(0);
                setMessages([{ sender: 'bot', text: QUESTIONS[0].botMsg }]);
              }}
            >
              🔄 Empezar de nuevo
            </button>
          </div>
        </div>
      ) : (
        /* CHAT CONVERSACIONAL */
        <div className="ai-chat-body">
          <div className="ai-messages-container">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`ai-message-row ${m.sender === 'user' ? 'msg-user' : 'msg-bot'}`}
              >
                {m.sender === 'bot' && <div className="bot-bubble-icon">✨</div>}
                <div className="ai-bubble">{m.text}</div>
              </div>
            ))}

            {isTyping && (
              <div className="ai-message-row msg-bot">
                <div className="bot-bubble-icon">✨</div>
                <div className="ai-bubble typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* BARRA DE ENTRADA */}
          <div className="ai-input-row">
            <input
              type="text"
              placeholder={QUESTIONS[currentStep]?.placeholder || 'Escribe tu respuesta...'}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              autoFocus
            />
            <button
              type="button"
              className="ai-send-btn"
              onClick={handleSend}
              disabled={!userInput.trim() || isTyping}
            >
              Enviar ➔
            </button>
          </div>

          <div className="ai-footer-note">
            <button type="button" className="ai-cancel-link" onClick={onCancel}>
              O prefiero rellenar el formulario manualmente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
