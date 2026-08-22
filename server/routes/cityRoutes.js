import express from "express";
import mongoose from "mongoose";
import { cityModel } from "../models/city.model.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

const FEATURED_CITIES = [
  { name: "Manali", country: "India", region: "Asia", costIndex: 50, popularityScore: 96, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", description: "Himalayan resort town famous for Solang Valley, snow slopes, and adventure sports." },
  { name: "Solang Valley", country: "India", region: "Asia", costIndex: 45, popularityScore: 92, imageUrl: "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800", description: "Popular valley near Manali known for paragliding, zorbing, and winter skiing." },
  { name: "Kasol", country: "India", region: "Asia", costIndex: 40, popularityScore: 90, imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800", description: "Scenic hamlet in Parvati Valley famous for trekking and pine forests near Manali." },
  { name: "Shimla", country: "India", region: "Asia", costIndex: 52, popularityScore: 93, imageUrl: "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800", description: "Capital of Himachal Pradesh with colonial architecture and Ridge viewpoint." },
  { name: "Kullu", country: "India", region: "Asia", costIndex: 45, popularityScore: 89, imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", description: "Valley of Gods known for river rafting, temples, and Himalayan landscapes." },
  { name: "Dharamshala", country: "India", region: "Asia", costIndex: 48, popularityScore: 91, imageUrl: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800", description: "Home of the Dalai Lama surrounded by cedar forests and Dhauladhar mountains." },
  { name: "Goa", country: "India", region: "Asia", costIndex: 60, popularityScore: 97, imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", description: "Famous beach state known for nightlife, Portuguese heritage, and water sports." },
  { name: "Udaipur", country: "India", region: "Asia", costIndex: 55, popularityScore: 93, imageUrl: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800", description: "City of Lakes featuring Lake Palace and royal Rajasthani heritage." },
  { name: "Paris", country: "France", region: "Europe", costIndex: 85, popularityScore: 98, imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800", description: "City of Light, famous for Eiffel Tower, Louvre, and romance." },
  { name: "Tokyo", country: "Japan", region: "Asia", costIndex: 90, popularityScore: 97, imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", description: "Bustling metropolis blending ultramodern skyscrapers and ancient temples." },
  { name: "New York", country: "USA", region: "North America", costIndex: 95, popularityScore: 96, imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800", description: "The Big Apple featuring Times Square, Central Park, and Broadway." },
  { name: "London", country: "United Kingdom", region: "Europe", costIndex: 88, popularityScore: 95, imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800", description: "Historic capital with Big Ben, London Eye, and rich heritage." },
  { name: "Rome", country: "Italy", region: "Europe", costIndex: 82, popularityScore: 94, imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800", description: "Eternal City with the Colosseum, Vatican City, and Roman Forum." },
  { name: "Barcelona", country: "Spain", region: "Europe", costIndex: 78, popularityScore: 93, imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800", description: "Vibrant Catalan capital known for Sagrada Familia and Mediterranean beaches." },
  { name: "Sydney", country: "Australia", region: "Oceania", costIndex: 86, popularityScore: 92, imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800", description: "Iconic harbour city with Opera House and Bondi Beach." },
  { name: "Dubai", country: "United Arab Emirates", region: "Asia", costIndex: 92, popularityScore: 95, imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800", description: "Luxury destination with Burj Khalifa, desert safaris, and mega malls." },
  { name: "Singapore", country: "Singapore", region: "Asia", costIndex: 89, popularityScore: 93, imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800", description: "Garden city featuring Marina Bay Sands and Gardens by the Bay." },
  { name: "Amsterdam", country: "Netherlands", region: "Europe", costIndex: 84, popularityScore: 91, imageUrl: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800", description: "Famous for picturesque canals, museum quarter, and bike culture." },
  { name: "Bangkok", country: "Thailand", region: "Asia", costIndex: 55, popularityScore: 92, imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800", description: "Energetic city known for ornate shrines and vibrant street life." },
  { name: "Istanbul", country: "Turkey", region: "Europe", costIndex: 62, popularityScore: 90, imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800", description: "Crossroads of East and West featuring Hagia Sophia and Grand Bazaar." },
  { name: "Cairo", country: "Egypt", region: "Africa", costIndex: 50, popularityScore: 89, imageUrl: "https://images.unsplash.com/photo-1572252821128-56f874945417?w=800", description: "Gateway to the Great Pyramids of Giza and Sphinx." },
  { name: "Rio de Janeiro", country: "Brazil", region: "South America", costIndex: 65, popularityScore: 88, imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800", description: "Famed for Christ the Redeemer statue and Copacabana beach." },
  { name: "Mumbai", country: "India", region: "Asia", costIndex: 55, popularityScore: 91, imageUrl: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800", description: "City of Dreams with Gateway of India, Marine Drive, and Bollywood." },
  { name: "Delhi", country: "India", region: "Asia", costIndex: 50, popularityScore: 90, imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800", description: "Historic capital featuring Red Fort, Qutub Minar, and India Gate." },
  { name: "Jaipur", country: "India", region: "Asia", costIndex: 45, popularityScore: 89, imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800", description: "The Pink City of Rajasthan with Hawa Mahal and Amber Fort." },
  { name: "Kyoto", country: "Japan", region: "Asia", costIndex: 80, popularityScore: 94, imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800", description: "Cultural heart of Japan with classical Buddhist temples and gardens." },
  { name: "Bali", country: "Indonesia", region: "Asia", costIndex: 60, popularityScore: 95, imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800", description: "Tropical paradise with lush rice terraces, beaches, and temples." },
  { name: "Cape Town", country: "South Africa", region: "Africa", costIndex: 65, popularityScore: 89, imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800", description: "Coastal city overlooked by majestic Table Mountain." },
  { name: "Venice", country: "Italy", region: "Europe", costIndex: 87, popularityScore: 93, imageUrl: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800", description: "Romantic city of canals, gondolas, and St. Mark's Square." },
  { name: "Prague", country: "Czech Republic", region: "Europe", costIndex: 70, popularityScore: 91, imageUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800", description: "City of a Hundred Spires with historic Charles Bridge." },
  { name: "San Francisco", country: "USA", region: "North America", costIndex: 94, popularityScore: 90, imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800", description: "Famous for the Golden Gate Bridge, cable cars, and tech hub." },
  { name: "Los Angeles", country: "USA", region: "North America", costIndex: 92, popularityScore: 91, imageUrl: "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800", description: "Entertainment capital featuring Hollywood, Santa Monica, and Beverly Hills." },
  { name: "Seoul", country: "South Korea", region: "Asia", costIndex: 82, popularityScore: 93, imageUrl: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800", description: "Dynamic metropolis where pop culture meets ancient palaces." },
  { name: "Toronto", country: "Canada", region: "North America", costIndex: 85, popularityScore: 88, imageUrl: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800", description: "Multicultural Canadian hub featuring CN Tower." },
  { name: "Berlin", country: "Germany", region: "Europe", costIndex: 78, popularityScore: 90, imageUrl: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800", description: "Vibrant capital known for art scene, nightlife, and Brandenburg Gate." },
  { name: "Vienna", country: "Austria", region: "Europe", costIndex: 82, popularityScore: 89, imageUrl: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800", description: "Imperial capital famous for classical music, palaces, and coffeehouses." },
  { name: "Zurich", country: "Switzerland", region: "Europe", costIndex: 98, popularityScore: 88, imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800", description: "Picturesque alpine lakeside city known for high quality of life." }
];

router.get("/", async (req, res) => {
  try {
    // Upsert featured cities into DB
    for (const city of FEATURED_CITIES) {
      await cityModel.updateOne(
        { name: city.name },
        { $setOnInsert: city },
        { upsert: true }
      );
    }

    const { search, country, region, sort } = req.query;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (country) filter.country = { $regex: country, $options: "i" };
    if (region) filter.region = { $regex: region, $options: "i" };

    const sortOption = sort === "costIndex"
      ? { costIndex: 1 }
      : { popularityScore: -1 };

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const [cities, total] = await Promise.all([
      cityModel.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      cityModel.countDocuments(filter)
    ]);

    res.json({
      data: cities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid city id" });
    }

    const city = await cityModel.findById(id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    res.json(city);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
