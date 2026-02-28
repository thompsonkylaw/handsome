import React from 'react';
import { Delete } from 'lucide-react';

const keys = [
  '7', '8', '9',
  '4', '5', '6',
  '1', '2', '3',
  '.', '0', 'AC',
];

const NumberPad = ({ 
  onInput, 
  onDelete, 
  onClear, 
  onConfirm, 
  allowDecimal = true 
}) => {
  const keepInputFocus = (e) => {
    // Prevent buttons from stealing focus (so physical keyboard keeps working)
    if (e?.preventDefault) e.preventDefault();
  };

  const handleClick = (key) => {
    if (key === 'AC') {
      if (onClear) onClear();
    } else if (key === '.') {
      if (allowDecimal) onInput(key);
    } else {
      onInput(key);
    }
  };

  return (
    <div className="bg-slate-100 p-3 w-[260px] rounded-2xl shadow-xl select-none isolate-numpad">
      <style>{`
        /* --- RESET & BASE STYLES --- */
        .isolate-numpad button.numpad-btn {
            margin: 0 !important;
            padding: 0 !important;
            line-height: normal !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            border: none !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: sans-serif !important;
            font-weight: bold !important;
            font-size: 1.25rem !important;
            height: 48px !important;
            border-radius: 8px !important;
            width: 100% !important;
            
            /* DISABLE ALL TAP HIGHLIGHTS & FOCUS RINGS */
            -webkit-tap-highlight-color: transparent !important;
            outline: none !important;
            box-shadow: 0 3px 0 #cbd5e1 !important; /* Default shadow */
            transition: transform 0.1s ease !important; /* Only animate movement */
            
            /* REMOVE POTENTIAL EXTERNAL HOVER EFFECTS */
            filter: none !important;
            backdrop-filter: none !important;
            background-image: none !important;
        }

        /* --- ACTIVE STATE ONLY (Press Down Effect) --- */
        /* This applies to ALL devices. No color change, just movement. */
        .isolate-numpad button.numpad-btn:active {
            transform: translateY(3px) !important;
            box-shadow: none !important;
        }

        /* --- COLORS (Force same color on Hover/Active/Focus) --- */
        
        /* White Numeric Buttons */
        .isolate-numpad .btn-num,
        .isolate-numpad .btn-num:hover,
        .isolate-numpad .btn-num:focus,
        .isolate-numpad .btn-num:active {
            background-color: #ffffff !important;
            color: #334155 !important;
            filter: none !important;
        }

        /* AC Yellow Button */
        .isolate-numpad .btn-ac,
        .isolate-numpad .btn-ac:hover,
        .isolate-numpad .btn-ac:focus,
        .isolate-numpad .btn-ac:active {
            background-color: #facc15 !important;
            color: #713f12 !important;
            filter: none !important;
        }
        .isolate-numpad .btn-ac,
        .isolate-numpad .btn-ac:hover,
        .isolate-numpad .btn-ac:focus {
            box-shadow: 0 3px 0 #ca8a04 !important;
        }

        /* OK Blue Button */
        .isolate-numpad .btn-ok,
        .isolate-numpad .btn-ok:hover,
        .isolate-numpad .btn-ok:focus,
        .isolate-numpad .btn-ok:active {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
            filter: none !important;
            margin-top: 0px !important;
        }
        .isolate-numpad .btn-ok,
        .isolate-numpad .btn-ok:hover,
        .isolate-numpad .btn-ok:focus {
            box-shadow: 0 3px 0 #1d4ed8 !important;
        }

        /* Delete Red Button */
        .isolate-numpad .btn-del,
        .isolate-numpad .btn-del:hover,
        .isolate-numpad .btn-del:focus,
        .isolate-numpad .btn-del:active {
            background-color: #f43f5e !important;
            color: #ffffff !important;
            filter: none !important;
        }
        .isolate-numpad .btn-del,
        .isolate-numpad .btn-del:hover,
        .isolate-numpad .btn-del:focus {
            box-shadow: 0 3px 0 #be123c !important;
        }

        /* Disabled State */
        .isolate-numpad .btn-disabled {
            opacity: 0.3 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
        }
      `}</style>

      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => (
          <button
            key={key}
            onMouseDown={keepInputFocus}
            onClick={() => handleClick(key)}
            className={`
              numpad-btn 
              ${key === 'AC' ? 'btn-ac' : 'btn-num'} 
              ${key === '.' && !allowDecimal ? 'btn-disabled' : ''}
            `}
          >
            {key}
          </button>
        ))}

        {/* DELETE BUTTON */}
        <button 
          onMouseDown={keepInputFocus}
          onClick={onDelete} 
          className="numpad-btn btn-del"
          aria-label="Delete"
          style={{ gridColumn: 'span 2' }}
        >
          <Delete size={24} />
        </button>

        {/* OK BUTTON */}
        <button 
          onMouseDown={keepInputFocus}
          onClick={onConfirm} 
          className="numpad-btn btn-ok"
          style={{ gridColumn: 'span 1' }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default NumberPad;