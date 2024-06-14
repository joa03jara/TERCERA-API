require('dotenv').config();

const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Conexión a MongoDB sin opciones deprecadas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.log(err));

// Esquema de Weather
const searchSchema = new mongoose.Schema({
    location: String,
    date: { type: Date, default: Date.now }
}, { collection: 'searches' }); // Asegúrate de que el nombre de la colección es válido

const Search = mongoose.model('Search', searchSchema);

// Ruta de Weather
app.get('/api/weather', async (req, res) => {
    const { location } = req.query;

    if (!location) {
        return res.status(400).json({ error: 'Loclizacion es requerida' });
    }
        const apiurl = `http://api.weatherapi.com/v1/current.json?key=14b455b186e84145b15202812241006&q=${location}&aqi=no`
    try {
      //  const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=14b455b186e84145b15202812241006&units=metric`);
        const response = await axios.get(apiurl);

        const weatherData = response.data;

        const newSearch = new Search({ location });
        await newSearch.save();

        console.log('Weather data:', weatherData);  // Log de los datos de respuesta

        res.json(weatherData);
    } catch (error) {
        console.error('Error al obtener datos meteorológicos:', error);  // Log del error
        res.status(500).json({ error: 'Error al obtener datos meteorológicos' });
    }
});

// Ruta de historial
app.get('/api/history', async (req, res) => {
    try {
        const history = await Search.find().sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Error al recuperar el historial de busqueda' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en el puerto ${PORT}`);
});
