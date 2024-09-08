import './App.css';
import CitySelector from './CitySelector';

function App() {
  return (
    <div className="App">
      <div className="Container">
        <div className='citycont'>
        <CitySelector />
        </div>
        <div className='data'></div>
      </div>
    </div>
  );
}

export default App;
