import {render} from 'preact';
import {App} from './app/App';
import {applyStoreTheme, storeConfig} from './config/store';
import './styles/index.css';

applyStoreTheme(storeConfig);

render(<App />, document.getElementById('app')!);
