import { HashRouter, Route, Switch } from 'react-router-dom';
import AppForm from './containers/AppForm';
import Items from './components/Items';

function App() {
  return (
    <HashRouter>
      <Switch>
        <Route path="/" exact render={props => <AppForm {...props} />} />
        <Route path="/logged_in" exact render={props => <Items {...props} />} />
      </Switch>
  </HashRouter>
  );
}

export default App;
