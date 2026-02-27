// WordPress CSS Override Helpers
// Inline styles to prevent WordPress from overriding button/input/select styling
// when this React app is enqueued inside a WordPress page.

const _btnBase = {
  appearance: 'none',
  WebkitAppearance: 'none',
  border: 'none',
  outline: 'none',
  background: 'none',
  backgroundImage: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textDecoration: 'none',
  textTransform: 'none',
  boxShadow: 'none',
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
  margin: 0,
  padding: 0,
  color: 'inherit',
  WebkitTapHighlightColor: 'transparent',
};

const _inputBase = {
  appearance: 'none',
  WebkitAppearance: 'none',
  outline: 'none',
  backgroundImage: 'none',
  fontFamily: 'inherit',
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
  margin: 0,
  boxSizing: 'border-box',
  color: 'inherit',
  WebkitTapHighlightColor: 'transparent',
};

const _selectBase = {
  appearance: 'none',
  WebkitAppearance: 'none',
  outline: 'none',
  backgroundImage: 'none',
  fontFamily: 'inherit',
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
  margin: 0,
  boxSizing: 'border-box',
  color: 'inherit',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

/** Button inline style – pass visual overrides */
export const wpBtn = (s) => ({ ..._btnBase, ...s });

/** Input inline style – pass visual overrides */
export const wpInput = (s) => ({ ..._inputBase, ...s });

/** Select inline style – pass visual overrides */
export const wpSelect = (s) => ({ ..._selectBase, ...s });
