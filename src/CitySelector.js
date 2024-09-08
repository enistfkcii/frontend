// CitySelector.js
import React, { useState,useEffect  } from 'react';
import axios from 'axios';
import './App.css';
import ClipLoader from 'react-spinners/ClipLoader';
import tempIcon from '../src/icons/thermometer.png';
import weatherIcon from '../src/icons/weather-forecast.png';
import humidityIcon from '../src/icons/humidity.png';
import consumptionIcon from '../src/icons/electricity.png';

const CitySelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCityID,setSelectedCityID] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherDetails, setWeatherDetails] = useState(null);
  const [averageConsumption, setAverageConsumption] = useState('');


  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('http://localhost:8080/getAllCities');
        setCities(response.data.cities);
        setLoading(false);
      } catch (error) {
        setError(error.message);
      } finally {
      }
    };
    
    fetchCities();
  }, []);
  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleCitySelect = async (city,index) => {
    setSelectedCity(city);
    setIsOpen(false);
    setSelectedCityID(index);
    
    try {
      
      const response = await axios.get(`http://localhost:8080/getWeather?city=${city}`);
      const jsonData = response.data;
      const firstDayWeather = jsonData.result[0];
      setWeatherDetails(firstDayWeather);
      const temp = parseFloat(firstDayWeather.degree);
      
      if (temp < 0) {
        setAverageConsumption("Yüksek Tüketim");       
      } 
      else if (temp >= 0 && temp < 15) {
        setAverageConsumption("Normal Tüketim");
      }
       else if (temp >= 15 && temp < 25) {
        setAverageConsumption("Az Tüketim");
      }
       else 
      {
        setAverageConsumption("Çok Az Tüketim");
      }
    } catch (error) {
      setError('Error fetching weather details');
      console.error('Error fetching weather details:', error);
    }
  };
  const handleSubmit = async () => {
    if (!selectedCity || !weatherDetails) {
      alert('Please select a city and wait for weather details.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/addConsumption', {
        cityId: selectedCityID,
        temperature: weatherDetails.degree,
        averageConsumption: averageConsumption,
      });
      alert('Data submitted successfully');
      console.log('Submission response:', response.data);
    } catch (error) {
      alert('Error submitting data');
      console.error('Error submitting data:', error);
    }
  };
  if (loading) {
    return (
      <div className="spinner-container">
        <ClipLoader color="#2298db" size={150} />
        <p>Şehirler Yükleniyor...</p>
      </div>
    );
  }
  if (error) return <p>Şehir Yüklenirken hata oluştu: {error}</p>;

  return (
    <div>
      <div className="dropdown">
        <button className="dropdown-button" onClick={toggleDropdown}>
          {selectedCity ? selectedCity : 'Select a city'}
        </button>
        {isOpen && (
          <ul className="dropdown-menu">
            {cities.length > 0 ? (
              cities.map((city, index) => (
                <li key={index} onClick={() => handleCitySelect(city,index+1)}>
                  {city}
                </li>
              ))
            ) : (
              <li>Şehir Bulunamadı</li>
            )}
          </ul>
        )}
      </div>
      <div className="city-info">
      {selectedCity && <h2>{selectedCity}</h2>}
        {weatherDetails && (
          <div className="weather-details">
            <h3>{weatherDetails.date} | {weatherDetails.day}</h3>
            <div className="weather-card">
              <img src={weatherDetails.icon} alt={weatherDetails.status} className="weather-icon" />
              <div className="weather-content">
                <p><img src={tempIcon} alt="Temperature" className="info-icon" /><strong>Sıcaklık:</strong> {weatherDetails.degree}°C</p>
                <p><img src={weatherIcon} alt="Status" className="info-icon" /><strong>Hava Durumu:</strong> {weatherDetails.description}</p>
                <p><img src={humidityIcon} alt="Humidity" className="info-icon" /><strong>Nem:</strong> {weatherDetails.humidity}%</p>
                <p><img src={consumptionIcon} alt="Consumption" className="info-icon" /><strong>Ortalama Tüketim:</strong> {averageConsumption}</p>
              </div>
            </div>
            <button className="info-button" onClick={handleSubmit}>Gönder</button>
          </div>
        )}
          
      </div>
    </div>
  );
};

export default CitySelector;
