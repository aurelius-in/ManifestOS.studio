@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
  background: #080706;
  color: #fff8e7;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(217, 155, 34, 0.12), transparent 30%),
    #080706;
  font-family: Arial, Helvetica, sans-serif;
}

* {
  box-sizing: border-box;
}

textarea,
button,
a {
  transition: all 150ms ease-in-out;
}
