import { Component, type ReactNode } from 'react';
import { ErrorState } from '../ui';

type Props = { children: ReactNode; resetKey?: string };
type State = { error: Error | null };

/** Łapie błędy renderu ekranu (np. z `useLiveQuery`) i pokazuje ErrorState zamiast białej strony. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          message={this.state.error.message}
          onRetry={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}
