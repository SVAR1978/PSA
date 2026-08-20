import { PasswordAnalyzer } from './components/PasswordAnalyzer';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Password Strength Analyzer</h1>
        <p></p>
      </header>
      <main className="main-content">
        <PasswordAnalyzer />
      </main>
    </div>
  );
}

export default App;
