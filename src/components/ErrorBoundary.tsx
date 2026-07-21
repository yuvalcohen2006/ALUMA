import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => {
    this.setState({ hasError: false });
    if (typeof window !== "undefined") window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        dir="rtl"
        className="min-h-dvh bg-background flex items-center justify-center px-6 py-20"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md text-center">
          <div className="font-display text-6xl md:text-7xl text-primary/20 leading-none mb-4">
            !
          </div>
          <h1 className="font-display text-2xl md:text-3xl text-primary leading-tight mb-3">
            משהו השתבש
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8">
            התרחשה שגיאה לא צפויה. אפשר לרענן את הדף או לחזור לדף הבית.
            אם זה חוזר על עצמו — נשמח שתיצרו קשר.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center bg-primary hover:bg-accent text-primary-foreground px-6 py-3 rounded-sm tracking-wide transition-smooth"
            >
              רענון הדף
            </button>
            <button
              onClick={this.reset}
              className="inline-flex items-center justify-center border border-primary/40 text-primary hover:bg-secondary px-6 py-3 rounded-sm tracking-wide transition-smooth"
            >
              חזרה לדף הבית
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
