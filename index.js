const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const logger = require('./logger');
const mongoose = require('mongoose');
const cors = require('cors');

const ClothingCategory = require('./models');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = 3000;
app.use(cors());
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => console.error('Error connecting to MongoDB:', err));


app.use(bodyParser.json());


// Endpoint to calculate dimensions based on category
app.post('/add-category-dimensions', async (req, res) => {
    try {
        const { category, length, breadth, height } = req.body;
        if (!category || !length || !breadth || !height) {
            throw new Error('Please provide category, length, breadth, and height');
        }

        // Create a new ClothingCategory document and save it to the database
        const newCategory = new ClothingCategory({
            category: category.toLowerCase(),
            length: parseFloat(length),
            width: parseFloat(breadth), // Assuming breadth corresponds to width
            height: parseFloat(height)
        });
        await newCategory.save();

        res.status(200).json({ message: 'Category dimensions added successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/calculate-dimensions', async (req, res) => {
    try {
        const { category, order_id } = req.body;

        if (!category) {
            throw new Error('Invalid input data: category is missing');
        }

        // Query the database to find the category dimensions
        const categoryDocument = await ClothingCategory.findOne({ category: category.toLowerCase() });
        
        if (!categoryDocument) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const totalDimensions = {
            length: categoryDocument.length,
            breadth: categoryDocument.width,
            height: categoryDocument.height
        };

        res.json(totalDimensions);

        // Assuming sendDimensionsToDelhivery is an asynchronous function
        let response = await sendDimensionsToDelhivery(totalDimensions, order_id );

        console.log("response from delhivery", response);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(400).json({ error: error.message });
    }
})

async function sendDimensionsToDelhivery(dimensions, waybill) {
    try {
        const apiUrl = 'https://track.delhivery.com/api/p/edit';
        const authToken = '2b17a2fcec197bcaac19c63d8e26d83a54f532a4'; // for PROD

        // Request body
        const requestBody = {
            order_id: order_id.toString(),
            shipment_length: parseFloat(dimensions.length + ".0"),
            shipment_width: parseFloat(dimensions.breadth + ".0"),
            shipment_height: parseFloat(dimensions.height + ".0"),
        };
        console.log(requestBody)
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Authorization': `Token ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response from Delhivery API:', response.data);
        return response.data;

    } catch (error) {
        console.error('Error sending request to Delhivery API:', error.message);
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
