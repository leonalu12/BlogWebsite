-- Create user table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    fname  VARCHAR(50),
    lname VARCHAR(50),
    description TEXT,
    dob DATE,
    icon VARCHAR(255),
    pwd VARCHAR(255)
);

-- Create comment table
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    layer INTEGER,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    article_id INTEGER,
    parent_cid INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_cid) REFERENCES comments(id) ON DELETE CASCADE
);

-- Create article table
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255),
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create img table
CREATE TABLE IF NOT EXISTS imgs(
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    path VARCHAR(255),
    article_id INTEGER,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Create like_c table (user likes comment relationship)
CREATE TABLE IF NOT EXISTS like_c (
    user_id INTEGER NOT NULL,
    comment_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, comment_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Create like_a table (user likes article relationship)
CREATE TABLE IF NOT EXISTS like_a (
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    pwd VARCHAR(255)
);

-- Insert sample users
INSERT INTO users (username, fname, lname, description, dob, icon, pwd) VALUES
('john_doe', 'John', 'Doe', 'Photography enthusiast and travel blogger', '1985-06-15', 'avatar1.png', 'password123'),
('jane_smith', 'Jane', 'Smith', 'Food lover and amateur chef', '1990-11-23', 'avatar2.png', 'password456'),
('alice_jones', 'Alice', 'Jones', 'Tech blogger and software developer', '1988-03-09', 'avatar3.png', 'password789'),
('bob_wilson', 'Bob', 'Wilson', 'Fitness trainer and health consultant', '1982-07-30', 'avatar4.png', 'password101'),
('emma_davis', 'Emma', 'Davis', 'Fashion blogger and style enthusiast', '1993-09-17', 'avatar5.png', 'password202'),
('michael_brown', 'Michael', 'Brown', 'Travel writer and adventurer', '1987-12-05', '1739143411474.JPG', 'password303'),
('sarah_miller', 'Sarah', 'Miller', 'Book reviewer and literature lover', '1991-04-28', 'avatar2.png', 'password404'),
('david_taylor', 'David', 'Taylor', 'Music producer and artist', '1989-08-14', 'avatar3.png', 'password505'),
('lisa_anderson', 'Lisa', 'Anderson', 'Environmental activist and blogger', '1986-01-22', 'avatar4.png', 'password606'),
('james_martin', 'James', 'Martin', 'Sports analyst and former athlete', '1984-05-11', 'avatar5.png', 'password707');

-- Insert sample articles with rich HTML content
INSERT INTO articles (content, date_time, title, user_id) VALUES
('<article><h2>Hidden Gems of Paris: A Photographer''s Journey</h2>
<p>As a photographer wandering through the streets of Paris, I''ve discovered that the true essence of this magnificent city lies far beyond the iconic Eiffel Tower and the bustling Champs-Élysées. In this photo essay, I''ll take you through the lesser-known corners of Paris that capture its authentic spirit.</p>
<h3>The Hidden Courtyards of Le Marais</h3>
<p>Deep within the maze-like streets of Le Marais, centuries-old courtyards tell stories of Paris''s aristocratic past. These secret spaces, often hidden behind unassuming wooden doors, reveal stunning architectural details, from ornate fountains to perfectly manicured gardens. One particular courtyard at 7 Rue de Sévigné showcases an exceptional example of 17th-century French architecture, with its symmetrical design and intricate stone carvings.</p>
<h3>The Artisan Workshops of Belleville</h3>
<p>Belleville, once a working-class neighborhood, has transformed into a haven for artists while maintaining its authentic Parisian character. Small workshops line the cobblestone streets, where craftsmen continue traditions passed down through generations. The afternoon light filtering through the narrow streets creates perfect photography conditions, highlighting the textures of old buildings and the vibrant street art that adorns them.</p>
<h3>Technical Photography Notes</h3>
<ul>
<li>Camera: Canon EOS R5</li>
<li>Primary Lens: 24-70mm f/2.8</li>
<li>Time of Day: Golden Hour (typically 4-6 PM in summer)</li>
<li>Post-processing: Minimal, focusing on preserving natural light and shadows</li>
</ul></article>', '2023-01-15 10:00:00', 'Hidden Paris', 1),

('<article><h2>Traditional Family Recipes: A Culinary Heritage</h2>
<p>Food has always been the thread that weaves families together, and nowhere is this more evident than in the treasured recipes passed down through generations. Today, I''m sharing some of my grandmother''s most cherished recipes, each carrying its own story and significance.</p>
<h3>The Perfect Homemade Pasta</h3>
<p>My grandmother''s pasta recipe, perfected over 50 years, creates strands of silky smooth tagliatelle that puts store-bought versions to shame. The secret lies in the precise ratio of "00" flour to farm-fresh eggs, and the patient kneading process that develops just the right amount of gluten.</p>
<div class="recipe">
<h4>Ingredients:</h4>
<ul>
<li>400g tipo "00" flour</li>
<li>4 fresh eggs</li>
<li>Pinch of salt</li>
<li>1 tablespoon olive oil</li>
</ul>
<h4>Method:</h4>
<ol>
<li>Create a well with the flour</li>
<li>Gradually incorporate eggs</li>
<li>Knead for 10-12 minutes</li>
<li>Rest for 30 minutes</li>
</ol>
</div>
<h3>The Family Marinara Sauce</h3>
<p>This sauce recipe dates back to 1920s Sicily, where my great-grandmother would spend hours selecting the perfect San Marzano tomatoes. The key is in the slow cooking process, allowing the flavors to develop and meld together over several hours.</p></article>', '2023-01-20 12:30:00', 'Family Recipes', 2),

('<article><h2>The Future of AI: A Developer''s Perspective</h2>
<p>As we stand at the crossroads of technological evolution, artificial intelligence continues to reshape our world in unprecedented ways. Drawing from my decade of experience in AI development, I''ll explore the most significant trends and their implications for our future.</p>
<h3>The Rise of Multimodal AI</h3>
<p>We''re witnessing a paradigm shift from single-domain AI models to multimodal systems that can process and understand various types of input simultaneously. These systems can interpret text, images, speech, and even behavioral patterns in real-time, opening new possibilities for human-AI interaction.</p>
<h3>Ethical Considerations</h3>
<p>With great power comes great responsibility. As AI systems become more sophisticated, we must address crucial ethical considerations:</p>
<ul>
<li>Data privacy and consent</li>
<li>Algorithmic bias and fairness</li>
<li>Transparency in AI decision-making</li>
<li>Environmental impact of large-scale AI systems</li>
</ul>
<h3>Practical Applications</h3>
<div class="code-example">
<pre><code>
// Example of a simple neural network architecture
class NeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize) {
        this.layers = [
            new Layer(inputSize, hiddenSize),
            new Layer(hiddenSize, outputSize)
        ];
    }
}
</code></pre>
</div></article>', '2023-02-05 15:45:00', 'AI Future', 3),

('<article><h2>Essential Workout Routines for Busy Professionals</h2>
<p>In today''s fast-paced world, finding time for fitness can be challenging. As a fitness trainer with over a decade of experience, I''ve developed these efficient workout routines specifically for busy professionals who want to maintain their health without spending hours in the gym.</p>
<h3>Morning Energy Boost (15 minutes)</h3>
<p>Start your day with this high-intensity circuit:</p>
<ul>
<li>Jump squats (30 seconds)</li>
<li>Push-ups (30 seconds)</li>
<li>Mountain climbers (30 seconds)</li>
<li>Plank hold (30 seconds)</li>
</ul>
<p>Repeat twice with 30-second rest between circuits.</p>
<h3>Desk-Friendly Stretches</h3>
<p>Combat the effects of sitting with these discrete exercises:</p>
<div class="exercise-routine">
<ol>
<li>Seated shoulder rolls</li>
<li>Ankle rotations</li>
<li>Wrist stretches</li>
<li>Neck tilts</li>
</ol>
<p><em>Perform each movement 10 times, every 2 hours</em></p>
</div>
<h3>Science Behind the Routines</h3>
<p>These workouts are designed based on recent research in exercise physiology, showing that short, intense bursts of activity can be as effective as longer moderate sessions. The key is maintaining proper form and consistency.</p></article>', 
'2023-02-10 09:15:00', 'Quick Workouts', 4),

('<article><h2>Spring Fashion Trends 2024: A Comprehensive Guide</h2>
<p>As we approach the new season, it''s time to explore the most exciting trends that will define fashion in 2024. From sustainable materials to bold color choices, this guide will help you navigate the evolving landscape of style.</p>
<h3>Sustainable Fashion Takes Center Stage</h3>
<p>This season marks a significant shift towards eco-conscious fashion:</p>
<ul>
<li>Recycled fiber blends</li>
<li>Zero-waste pattern cutting</li>
<li>Biodegradable materials</li>
<li>Vintage-inspired designs</li>
</ul>
<h3>Color Trends</h3>
<div class="color-palette">
<p>Key colors for Spring 2024:</p>
<ul>
<li>Digital Lavender</li>
<li>Cyber Lime</li>
<li>Tranquil Blue</li>
<li>Sunset Orange</li>
</ul>
</div>
<h3>Must-Have Pieces</h3>
<p>Investment pieces for your wardrobe:</p>
<ol>
<li>Oversized blazers in pastel shades</li>
<li>High-waisted wide-leg trousers</li>
<li>Sustainable denim pieces</li>
<li>Minimalist accessories</li>
</ol>
<p>Styling tips and combination suggestions included in the next section...</p></article>', 
'2023-03-01 14:20:00', 'Fashion Trends', 5),

('<article><h2>Backpacking Through Southeast Asia: A Complete Guide</h2>
<p>After spending six months exploring the hidden corners of Southeast Asia, I''ve compiled this comprehensive guide to help fellow travelers navigate this fascinating region. From remote temples to bustling night markets, here''s everything you need to know.</p>
<h3>Essential Planning Tips</h3>
<div class="travel-planning">
<h4>Best Times to Visit:</h4>
<ul>
<li>Thailand: November to March</li>
<li>Vietnam: February to April</li>
<li>Cambodia: November to February</li>
<li>Laos: October to April</li>
</ul>
</div>
<h3>Budget Breakdown</h3>
<table class="cost-table">
<tr><th>Country</th><th>Daily Budget (USD)</th><th>Accommodation</th><th>Food</th></tr>
<tr><td>Thailand</td><td>30-40</td><td>10-15</td><td>5-10</td></tr>
<tr><td>Vietnam</td><td>25-35</td><td>8-12</td><td>4-8</td></tr>
<tr><td>Cambodia</td><td>25-30</td><td>7-10</td><td>5-8</td></tr>
</table>
<h3>Cultural Insights</h3>
<p>Understanding local customs is crucial for meaningful travel experiences...</p></article>', 
'2023-03-15 11:30:00', 'Asia Travel Guide', 6),

('<article><h2>Must-Read Books of 2023: A Literature Lover''s Guide</h2>
<p>As a passionate book reviewer and literature enthusiast, I''ve had the privilege of exploring countless literary works throughout 2023. Here''s my carefully curated list of the most impactful books that have shaped the literary landscape this year.</p>

<h3>Fiction Highlights</h3>
<div class="book-section">
  <h4>Contemporary Fiction</h4>
  <ul>
    <li>
      <strong>"The Echo of Memories" by Sarah Chen</strong>
      <p>A masterfully crafted narrative that weaves together three generations of a Chinese-American family, exploring themes of identity, belonging, and the weight of cultural heritage. Chen''s prose is both lyrical and precise, creating an immersive experience that resonates long after the final page.</p>
    </li>
    <li>
      <strong>"Quantum Dreams" by Michael Roberts</strong>
      <p>This genre-defying work blends scientific concepts with deeply human stories, creating a unique narrative that challenges our understanding of reality and consciousness.</p>
    </li>
  </ul>

  <h4>Literary Fiction</h4>
  <div class="book-analysis">
    <p>This year has seen a remarkable shift towards more experimental narrative structures, with authors pushing the boundaries of traditional storytelling. The integration of multiple viewpoints and non-linear timelines has become increasingly sophisticated, reflecting our complex modern experience.</p>
  </div>
</div>

<h3>Non-Fiction Breakthroughs</h3>
<div class="non-fiction-section">
  <table class="book-ratings">
    <tr>
      <th>Title</th>
      <th>Author</th>
      <th>Rating</th>
      <th>Key Themes</th>
    </tr>
    <tr>
      <td>"The Digital Mind"</td>
      <td>Dr. James Harrison</td>
      <td>4.8/5</td>
      <td>AI, Ethics, Future Technology</td>
    </tr>
    <tr>
      <td>"Climate Solutions Now"</td>
      <td>Emily Green</td>
      <td>4.9/5</td>
      <td>Environmental Science, Sustainability</td>
    </tr>
  </table>
</div></article>', '2023-04-01 16:45:00', 'Book Reviews 2023', 7),

('<article><h2>The Evolution of Digital Music Production</h2>
<p>As a music producer with over a decade of experience, I''ve witnessed the remarkable transformation of music production from hardware-dominated studios to powerful digital workstations. This comprehensive guide explores the current state of digital music production and its future trajectory.</p>

<h3>Modern Production Essentials</h3>
<div class="production-tools">
  <h4>Digital Audio Workstations (DAWs)</h4>
  <p>The heart of modern music production lies in sophisticated DAWs, offering capabilities that would have required entire studios in the past:</p>
  <ul>
    <li>Ableton Live: Ideal for electronic music and live performance</li>
    <li>Logic Pro X: Perfect for comprehensive music production</li>
    <li>Pro Tools: Industry standard for professional recording</li>
  </ul>

  <h4>Virtual Instruments</h4>
  <div class="tech-specs">
    <p>Modern virtual instruments utilize advanced sampling technology and synthesis:</p>
    <code>
      Sample Rate: 96kHz
      Bit Depth: 24-bit
      Latency: <2ms
    </code>
  </div>
</div>

<h3>The Role of AI in Music Production</h3>
<p>Artificial intelligence is revolutionizing how we approach music creation and production:</p>
<ol>
  <li>Intelligent mixing algorithms that analyze and adjust audio in real-time</li>
  <li>AI-powered mastering services providing professional-quality results</li>
  <li>Smart arrangement tools suggesting complementary musical elements</li>
</ol>

<div class="workflow-section">
  <h4>Modern Workflow Integration</h4>
  <p>Today''s production workflow combines traditional musicianship with cutting-edge technology, creating a hybrid approach that maximizes both creativity and efficiency.</p>
</div></article>', '2023-04-15 13:25:00', 'Digital Music', 8),

('<article><h2>Climate Action: Small Changes, Big Impact</h2>
<p>As an environmental activist and researcher, I''ve spent years studying how individual actions can collectively create significant environmental change. This comprehensive guide explores practical steps we can all take to combat climate change.</p>

<h3>Understanding Your Carbon Footprint</h3>
<div class="carbon-calculator">
  <h4>Daily Activities Impact</h4>
  <table class="emissions-table">
    <tr>
      <th>Activity</th>
      <th>Annual CO2 Impact (kg)</th>
      <th>Easy Alternatives</th>
    </tr>
    <tr>
      <td>Daily Commute (Car)</td>
      <td>2,400</td>
      <td>Public Transport, Cycling</td>
    </tr>
    <tr>
      <td>Meat Consumption</td>
      <td>1,500</td>
      <td>Plant-Based Meals</td>
    </tr>
  </table>
</div>

<h3>Sustainable Living Practices</h3>
<div class="actionable-steps">
  <ul>
    <li>Energy Conservation
      <ul>
        <li>LED lighting installation</li>
        <li>Smart thermostats</li>
        <li>Energy-efficient appliances</li>
      </ul>
    </li>
    <li>Waste Reduction
      <ul>
        <li>Composting</li>
        <li>Recycling</li>
        <li>Zero-waste shopping</li>
      </ul>
    </li>
  </ul>
</div>

<h3>Community Impact</h3>
<p>Individual actions create ripple effects throughout communities, inspiring others and building momentum for larger-scale change.</p></article>', '2023-05-01 10:10:00', 'Climate Action', 9),

('<article><h2>The Evolution of Modern Sports: A Comprehensive Analysis</h2>
<p>Drawing from my experience as both a former athlete and sports analyst, I''ve witnessed firsthand the dramatic transformation of sports over the past few decades. This analysis explores how technology, science, and societal changes have revolutionized athletic competition.</p>

<h3>The Technology Revolution in Sports</h3>
<div class="sports-tech">
  <h4>Performance Analysis Tools</h4>
  <table class="tech-comparison">
    <tr>
      <th>Technology</th>
      <th>Application</th>
      <th>Impact on Performance</th>
    </tr>
    <tr>
      <td>Motion Capture Systems</td>
      <td>Biomechanical Analysis</td>
      <td>15-20% Improvement in Technique</td>
    </tr>
    <tr>
      <td>GPS Tracking</td>
      <td>Player Movement Analysis</td>
      <td>30% Better Tactical Understanding</td>
    </tr>
    <tr>
      <td>AI Performance Prediction</td>
      <td>Training Optimization</td>
      <td>25% Injury Reduction</td>
    </tr>
  </table>

  <h4>Equipment Evolution</h4>
  <p>Modern sports equipment has undergone radical transformation, utilizing advanced materials science:</p>
  <ul>
    <li>Carbon fiber composites in rackets and bikes</li>
    <li>Smart fabrics in performance wear</li>
    <li>Computer-designed footwear</li>
    <li>Smart sensors in balls and equipment</li>
  </ul>
</div>

<h3>The Science of Athletic Development</h3>
<div class="training-science">
  <p>Contemporary athletic training incorporates multiple scientific disciplines:</p>
  <ol>
    <li>Sports Psychology
      <ul>
        <li>Mental resilience training</li>
        <li>Performance anxiety management</li>
        <li>Goal-setting techniques</li>
      </ul>
    </li>
    <li>Nutritional Science
      <ul>
        <li>Personalized diet plans</li>
        <li>Supplement protocols</li>
        <li>Recovery nutrition</li>
      </ul>
    </li>
  </ol>
</div>

<h3>The Future of Competition</h3>
<p>As we look ahead, several trends are shaping the future of sports:</p>
<div class="future-trends">
  <ul>
    <li>Virtual and augmented reality training</li>
    <li>Genetic insights in talent development</li>
    <li>Sustainable sports facility design</li>
    <li>Integration of esports with traditional sports</li>
  </ul>
</div></article>', '2023-05-15 15:15:00', 'Sports Evolution', 10),

('<article><h2>My Journey Through Italian Cuisine: A Gastronomic Adventure</h2>
<p>Having spent three months traveling through Italy''s diverse regions, I''ve discovered that Italian cuisine is far more varied and complex than most people realize. Each region offers its own unique flavors, techniques, and traditions that contribute to the rich tapestry of Italian gastronomy.</p>

<h3>Regional Specialties</h3>
<div class="cuisine-guide">
  <h4>Northern Italy</h4>
  <ul>
    <li>Risotto alla Milanese
      <p>The famous saffron-infused risotto that captures the essence of Lombardy''s sophisticated culinary tradition. The key lies in the perfect balance of Carnaroli rice, authentic saffron threads, and Parmigiano-Reggiano.</p>
    </li>
    <li>Vitello Tonnato
      <p>A Piedmontese specialty that showcases the region''s mastery of combining meat and seafood flavors.</p>
    </li>
  </ul>

  <h4>Central Italy</h4>
  <table class="pasta-guide">
    <tr>
      <th>Region</th>
      <th>Signature Pasta</th>
      <th>Key Ingredients</th>
    </tr>
    <tr>
      <td>Tuscany</td>
      <td>Pappardelle al Cinghiale</td>
      <td>Wild boar, rosemary, juniper</td>
    </tr>
    <tr>
      <td>Rome</td>
      <td>Carbonara</td>
      <td>Guanciale, Pecorino Romano, eggs</td>
    </tr>
  </table>
</div>

<h3>The Art of Italian Coffee</h3>
<p>Understanding Italian coffee culture is essential to appreciating the country''s gastronomic heritage. Here''s my guide to navigating the complex world of Italian coffee:</p>
<div class="coffee-guide">
  <ul>
    <li>Espresso: The foundation of Italian coffee culture</li>
    <li>Cappuccino: Only consumed before 11 AM</li>
    <li>Caffè Macchiato: The perfect afternoon pick-me-up</li>
  </ul>
</div></article>', '2023-06-01 12:00:00', 'Italian Food Journey', 2),

('<article><h2>Tech Trends That Will Shape 2024</h2>
<p>As a software developer and tech analyst with over 15 years of experience, I''ve been closely monitoring the evolving technology landscape. Here''s my in-depth analysis of the trends that will define technology in 2024 and beyond.</p>

<h3>Quantum Computing Breakthroughs</h3>
<div class="tech-analysis">
  <h4>Recent Developments</h4>
  <table class="quantum-progress">
    <tr>
      <th>Area</th>
      <th>Achievement</th>
      <th>Potential Impact</th>
    </tr>
    <tr>
      <td>Error Correction</td>
      <td>99.99% accuracy</td>
      <td>Stable quantum systems</td>
    </tr>
    <tr>
      <td>Qubit Scaling</td>
      <td>1000+ qubit processor</td>
      <td>Complex problem solving</td>
    </tr>
  </table>

  <h4>Practical Applications</h4>
  <ul>
    <li>Drug Discovery
      <p>Quantum simulations are revolutionizing molecular modeling, reducing drug development time from years to months.</p>
    </li>
    <li>Climate Modeling
      <p>Advanced weather prediction and climate change analysis with unprecedented accuracy.</p>
    </li>
  </ul>
</div>

<h3>AI Integration in Daily Life</h3>
<div class="ai-applications">
  <p>The integration of AI into everyday technologies has reached new heights:</p>
  <ol>
    <li>Personal AI Assistants
      <ul>
        <li>Context-aware responses</li>
        <li>Emotional intelligence</li>
        <li>Multilingual capabilities</li>
      </ul>
    </li>
    <li>Smart Home Evolution
      <ul>
        <li>Predictive maintenance</li>
        <li>Energy optimization</li>
        <li>Advanced security systems</li>
      </ul>
    </li>
  </ol>
</div>

<h3>Sustainable Tech</h3>
<p>Technology''s role in environmental conservation has become central to innovation:</p>
<div class="eco-tech">
  <ul>
    <li>Carbon-neutral data centers</li>
    <li>Biodegradable electronics</li>
    <li>Energy-harvesting devices</li>
  </ul>
</div></article>', '2023-06-15 14:30:00', 'Tech Trends 2024', 3),

('<article><h2>Sustainable Fashion: A Guide to Ethical Shopping</h2>
<p>The fashion industry is undergoing a revolutionary transformation towards sustainability. As a fashion consultant and environmental advocate, I''ve researched and experienced firsthand how conscious fashion choices can make a significant impact on our planet.</p>

<h3>Understanding Sustainable Materials</h3>
<div class="material-guide">
  <h4>Eco-Friendly Fabrics</h4>
  <table class="fabric-comparison">
    <tr>
      <th>Material</th>
      <th>Environmental Impact</th>
      <th>Durability</th>
      <th>Best Uses</th>
    </tr>
    <tr>
      <td>Organic Cotton</td>
      <td>Low</td>
      <td>High</td>
      <td>Everyday wear</td>
    </tr>
    <tr>
      <td>Recycled Polyester</td>
      <td>Medium</td>
      <td>Very High</td>
      <td>Athletic wear</td>
    </tr>
    <tr>
      <td>Hemp</td>
      <td>Very Low</td>
      <td>Excellent</td>
      <td>Durable garments</td>
    </tr>
  </table>
</div>

<h3>Circular Fashion Economy</h3>
<p>The future of fashion lies in circular economy principles:</p>
<div class="circular-fashion">
  <ol>
    <li>Design for Longevity
      <ul>
        <li>Quality construction</li>
        <li>Timeless styles</li>
        <li>Versatile pieces</li>
      </ul>
    </li>
    <li>Responsible Consumption
      <ul>
        <li>Capsule wardrobes</li>
        <li>Clothing rental services</li>
        <li>Second-hand shopping</li>
      </ul>
    </li>
  </ol>
</div>

<h3>Ethical Production</h3>
<div class="production-standards">
  <h4>Key Certifications to Look For:</h4>
  <ul>
    <li>Fair Trade Certified
      <p>Ensures fair wages and safe working conditions</p>
    </li>
    <li>GOTS Certified
      <p>Guarantees organic textile production standards</p>
    </li>
    <li>B Corp Certification
      <p>Verifies overall ethical business practices</p>
    </li>
  </ul>
</div></article>', '2023-07-01 11:45:00', 'Sustainable Fashion', 5),

('<article><h2>Hidden Trails: Discovering Nature''s Secrets</h2>
<p>After years of exploring the world''s most remote paths, I''ve discovered that the true essence of hiking lies not in reaching the summit, but in understanding the delicate ecosystems we traverse. Join me as we explore some of Earth''s most remarkable hidden trails.</p>

<h3>Ancient Forest Paths</h3>
<div class="trail-guide">
  <h4>Remarkable Discoveries</h4>
  <ul>
    <li>Old Growth Ecosystems
      <p>These forests, some over 1000 years old, host complex networks of interdependent species, from microscopic fungi to majestic eagles.</p>
    </li>
    <li>Natural Architecture
      <p>Nature''s own engineering marvels: natural bridges, cave systems, and living root bridges.</p>
    </li>
  </ul>

  <h4>Trail Difficulty Guide</h4>
  <table class="trail-ratings">
    <tr>
      <th>Trail Name</th>
      <th>Difficulty</th>
      <th>Length (km)</th>
      <th>Elevation (m)</th>
    </tr>
    <tr>
      <td>Ancient Cedar Path</td>
      <td>Moderate</td>
      <td>12</td>
      <td>800</td>
    </tr>
    <tr>
      <td>Valley Loop</td>
      <td>Easy</td>
      <td>8</td>
      <td>300</td>
    </tr>
  </table>
</div>

<h3>Conservation Efforts</h3>
<div class="conservation">
  <p>Key initiatives to protect these natural wonders:</p>
  <ol>
    <li>Trail Maintenance
      <ul>
        <li>Erosion control</li>
        <li>Native species protection</li>
        <li>Waste management</li>
      </ul>
    </li>
    <li>Community Engagement
      <ul>
        <li>Local guide training</li>
        <li>Educational programs</li>
        <li>Cultural preservation</li>
      </ul>
    </li>
  </ol>
</div></article>', '2023-07-15 09:30:00', 'Nature Trails', 6),

('<article><h2>The Art of Street Photography</h2>
<p>Street photography is more than just capturing candid moments—it''s about telling stories through visual narratives that reflect the human condition. Drawing from my decades of experience, I''ll share advanced techniques and philosophical approaches to this compelling art form.</p>

<h3>Technical Mastery</h3>
<div class="camera-settings">
  <h4>Optimal Configuration for Street Photography</h4>
  <table class="settings-guide">
    <tr>
      <th>Lighting Condition</th>
      <th>Aperture</th>
      <th>Shutter Speed</th>
      <th>ISO</th>
    </tr>
    <tr>
      <td>Bright Daylight</td>
      <td>f/8</td>
      <td>1/500</td>
      <td>100</td>
    </tr>
    <tr>
      <td>Golden Hour</td>
      <td>f/4</td>
      <td>1/250</td>
      <td>400</td>
    </tr>
    <tr>
      <td>Night Street</td>
      <td>f/2.8</td>
      <td>1/60</td>
      <td>3200</td>
    </tr>
  </table>
</div>

<h3>Compositional Techniques</h3>
<div class="composition">
  <p>Advanced principles for creating compelling street images:</p>
  <ul>
    <li>Layered Composition
      <p>Creating depth through multiple planes of interest, guiding the viewer''s eye through the frame.</p>
    </li>
    <li>Geometric Harmony
      <p>Using urban architecture to create strong geometric patterns and leading lines.</p>
    </li>
    <li>Human Elements
      <p>Incorporating people to add scale, emotion, and narrative to urban landscapes.</p>
    </li>
  </ul>
</div>

<h3>Ethics in Street Photography</h3>
<div class="ethics-guide">
  <h4>Responsible Practice</h4>
  <ol>
    <li>Respect Privacy
      <ul>
        <li>Understanding local laws</li>
        <li>Obtaining consent when appropriate</li>
        <li>Maintaining subject dignity</li>
      </ul>
    </li>
    <li>Cultural Sensitivity
      <ul>
        <li>Research local customs</li>
        <li>Respect religious practices</li>
        <li>Authentic representation</li>
      </ul>
    </li>
  </ol>
</div></article>', '2023-08-01 16:20:00', 'Street Photography', 1),

('<article><h2>Advanced Street Photography Techniques</h2>
<p>Building on the basics, let''s explore advanced techniques that can elevate your street photography.</p>
<h3>Mastering Light and Shadow</h3>
<p>Understanding how light interacts with urban environments is crucial.</p>
</article>', '2023-08-10 10:00:00', 'Advanced Street Photography', 1),

('<article><h2>The Ultimate Guide to Vegan Italian Cooking</h2>
<p>Italian cuisine can be adapted to vegan diets without sacrificing flavor.</p>
<h3>Veganizing Classic Dishes</h3>
<p>Learn how to make traditional dishes vegan.</p>
</article>', '2023-08-15 12:00:00', 'Vegan Italian Cooking', 2),

('<article><h2>Quantum Machine Learning: A New Frontier</h2>
<p>Combining quantum computing with machine learning offers unprecedented possibilities.</p>
<h3>Quantum Algorithms for ML</h3>
<p>Explore quantum algorithms that enhance machine learning.</p>
</article>', '2023-08-20 14:00:00', 'Quantum Machine Learning', 3),

('<article><h2>Rediscovering the Streets of London</h2>
<p>Join me on a deep dive into London''s hidden corners...</p></article>', '2023-09-01 10:00:00', 'London Streets', 2),
('<article><h2>Healthy Eating on a Budget</h2>
<p>Tips and tricks to stretch your dollar while maintaining a balanced diet...</p></article>', '2023-09-02 11:00:00', 'Budget Health', 5),
('<article><h2>Evolution of VR Gaming</h2>
<p>A comprehensive look at how VR gaming technology has progressed...</p></article>', '2023-09-03 14:00:00', 'VR Gaming', 3),
('<article><h2>Exploring Desert Landscapes</h2>
<p>Discover the mesmerizing beauty of arid regions around the world...</p></article>', '2023-09-04 09:30:00', 'Desert Exploration', 6),
('<article><h2>Minimalist Wardrobe Essentials</h2>
<p>Streamline your closet with these five must-have staples...</p></article>', '2023-09-05 16:15:00', 'Minimalist Fashion', 9);

-- Insert more detailed comments
INSERT INTO comments (content, layer, date_time, user_id, article_id, parent_cid) VALUES
-- Photography article comments (article_id: 1)
('Amazing photos! Your composition techniques are incredible.', 1, '2023-01-15 11:00:00', 2, 1, NULL),
('The light in these shots is absolutely magical.', 1, '2023-01-15 11:05:00', 3, 1, NULL),
('What time of day do you usually shoot?', 1, '2023-01-15 11:10:00', 4, 1, NULL),
('I typically shoot during golden hour, around 4-6 PM.', 2, '2023-01-15 11:15:00', 1, 1, 3),
('Your street photography tips helped me improve so much!', 1, '2023-01-15 11:20:00', 5, 1, NULL),
('Could you share your post-processing workflow?', 1, '2023-01-15 11:25:00', 6, 1, NULL),

-- Food article comments (article_id: 2)
('These recipes bring back memories of my Italian grandmother.', 1, '2023-01-20 13:00:00', 3, 2, NULL),
('The pasta making technique is spot on!', 1, '2023-01-20 13:05:00', 4, 2, NULL),
('Have you tried using different flour types?', 1, '2023-01-20 13:10:00', 5, 2, NULL),
('Yes, I''ve experimented with various "00" flours.', 2, '2023-01-20 13:15:00', 2, 2, 8),
('Your marinara sauce recipe is perfect!', 1, '2023-01-20 13:20:00', 6, 2, NULL),

-- Tech article comments (article_id: 3)
('Fascinating insights into AI development!', 1, '2023-02-05 16:00:00', 4, 3, NULL),
('How do you see AI impacting privacy concerns?', 1, '2023-02-05 16:05:00', 5, 3, NULL),
('Great point about ethical considerations.', 1, '2023-02-05 16:10:00', 6, 3, NULL),
('The code examples are very helpful.', 1, '2023-02-05 16:15:00', 7, 3, NULL),
('We need more discussions about AI ethics.', 2, '2023-02-05 16:20:00', 3, 3, 12),

-- Fitness article comments (article_id: 4)
('These workouts have completely transformed my morning routine!', 1, '2023-02-10 09:30:00', 3, 4, NULL),
('How do you maintain proper form during high-intensity exercises?', 1, '2023-02-10 09:35:00', 5, 4, NULL),
('Form is key - I recommend starting slowly and focusing on technique', 2, '2023-02-10 09:40:00', 4, 4, 17),
('Could you share more desk exercises for lower back pain?', 1, '2023-02-10 09:45:00', 7, 4, NULL),
('The science behind HIIT is fascinating!', 1, '2023-02-10 09:50:00', 8, 4, NULL),

-- Fashion article comments (article_id: 5)
('The sustainable fashion tips are incredibly practical', 1, '2023-03-01 14:30:00', 4, 5, NULL),
('How do you balance sustainability with affordability?', 1, '2023-03-01 14:35:00', 6, 5, NULL),
('It''s about investing in quality pieces that last longer', 2, '2023-03-01 14:40:00', 5, 5, 21),
('The color trends for 2024 are spot on!', 1, '2023-03-01 14:45:00', 8, 5, NULL),
('Would love a follow-up article on accessorizing', 1, '2023-03-01 14:50:00', 9, 5, NULL),

-- Travel article comments (article_id: 6)
('Your guide made my Southeast Asia trip so much easier', 1, '2023-03-15 11:40:00', 5, 6, NULL),
('Any tips for solo female travelers?', 1, '2023-03-15 11:45:00', 7, 6, NULL),
('The budget breakdown is incredibly helpful', 1, '2023-03-15 11:50:00', 8, 6, NULL),
('How did you handle the language barrier?', 1, '2023-03-15 11:55:00', 9, 6, NULL),
('Learning basic phrases in local languages helps a lot', 2, '2023-03-15 12:00:00', 6, 6, 26),

-- Literature article comments (article_id: 7)
('Finally, someone who appreciates experimental narratives!', 1, '2023-04-01 17:00:00', 6, 7, NULL),
('The Echo of Memories moved me to tears', 1, '2023-04-01 17:05:00', 8, 7, NULL),
('What are your thoughts on the rise of AI-generated literature?', 1, '2023-04-01 17:10:00', 9, 7, NULL),
('Would love more recommendations in the sci-fi genre', 1, '2023-04-01 17:15:00', 10, 7, NULL),
('This list will be my reading guide for the year', 2, '2023-04-01 17:20:00', 7, 7, 28),

-- Music production comments (article_id: 8)
('The DAW comparison is exactly what I needed', 1, '2023-04-15 13:30:00', 7, 8, NULL),
('How do you feel about analog vs digital production?', 1, '2023-04-15 13:35:00', 9, 8, NULL),
('The AI integration section is mind-blowing', 1, '2023-04-15 13:40:00', 10, 8, NULL),
('Can you elaborate on latency optimization?', 1, '2023-04-15 13:45:00', 1, 8, NULL),
('These virtual instruments sound incredible', 2, '2023-04-15 13:50:00', 8, 8, 33);

-- Add more interactive comments for remaining articles
INSERT INTO comments (content, layer, date_time, user_id, article_id, parent_cid) VALUES
-- Climate Action article comments (article_id: 9)
('What are the most effective ways to reduce personal carbon footprint?', 1, '2023-05-01 11:00:00', 2, 9, NULL),
('Reducing meat consumption and using public transport are key', 2, '2023-05-01 11:05:00', 9, 9, 40),
('Have you considered investing in renewable energy?', 1, '2023-05-01 11:10:00', 4, 9, NULL),
('Solar panels are a great long-term investment', 2, '2023-05-01 11:15:00', 9, 9, 42),
('What about the impact of fast fashion on the environment?', 1, '2023-05-01 11:20:00', 5, 9, NULL),
('Supporting sustainable brands and buying second-hand helps', 2, '2023-05-01 11:25:00', 9, 9, 44),

-- Sports Evolution article comments (article_id: 10)
('How has technology changed the training regimen for athletes?', 1, '2023-05-15 16:00:00', 3, 10, NULL),
('Data analysis and personalized training plans are now essential', 2, '2023-05-15 16:05:00', 10, 10, 46),
('What are the ethical implications of genetic testing in sports?', 1, '2023-05-15 16:10:00', 4, 10, NULL),
('It raises concerns about fairness and potential discrimination', 2, '2023-05-15 16:15:00', 10, 10, 48),
('How do you see esports integrating with traditional sports?', 1, '2023-05-15 16:20:00', 5, 10, NULL),
('They could complement each other, creating new forms of competition', 2, '2023-05-15 16:25:00', 10, 10, 50),

-- Italian Food Journey article comments (article_id: 11)
('Your journey through Italian cuisine is inspiring!', 1, '2023-06-01 13:00:00', 1, 11, NULL),
('What''s your favorite regional dish?', 1, '2023-06-01 13:05:00', 3, 11, NULL),
('I''m a big fan of the pasta dishes in Tuscany', 2, '2023-06-01 13:10:00', 2, 11, 52),
('Have you tried making your own pasta from scratch?', 1, '2023-06-01 13:15:00', 4, 11, NULL),
('It''s a rewarding experience, but requires patience', 2, '2023-06-01 13:20:00', 2, 11, 54),
('The coffee guide is incredibly helpful', 1, '2023-06-01 13:25:00', 5, 11, NULL),

-- Tech Trends 2024 article comments (article_id: 12)
('Quantum computing is truly revolutionary', 1, '2023-06-15 15:00:00', 2, 12, NULL),
('What are the biggest challenges in scaling quantum computers?', 1, '2023-06-15 15:05:00', 4, 12, NULL),
('Maintaining qubit stability is a major hurdle', 2, '2023-06-15 15:10:00', 3, 12, 58),
('How will AI impact job markets in the future?', 1, '2023-06-15 15:15:00', 5, 12, NULL),
('Upskilling and adaptation will be crucial', 2, '2023-06-15 15:20:00', 3, 12, 60),
('Sustainable tech is the way forward', 1, '2023-06-15 15:25:00', 6, 12, NULL),

-- Comments for Advanced Street Photography (article_id: 16)
('Great tips! How do you handle challenging lighting conditions?', 1, '2023-08-10 11:00:00', 2, 16, NULL),
('Using reflectors and shooting during golden hour helps', 2, '2023-08-10 11:10:00', 1, 16, 61),
('What about shooting at night?', 1, '2023-08-10 11:20:00', 3, 16, NULL),
('High ISO and wide aperture lenses are essential', 2, '2023-08-10 11:30:00', 1, 16, 63),
('Do you ever use external flashes?', 1, '2023-08-10 11:40:00', 4, 16, NULL),
('Rarely, but small speedlights can be useful', 2, '2023-08-10 11:50:00', 1, 16, 65),
('Thanks for the insights!', 3, '2023-08-10 12:00:00', 2, 16, 66),

-- Comments for Vegan Italian Cooking (article_id: 17)
('This is amazing! I''ve been looking for vegan Italian recipes', 1, '2023-08-15 13:00:00', 3, 17, NULL),
('What do you use as a cheese substitute?', 1, '2023-08-15 13:10:00', 2, 17, NULL),
('Nut-based cheeses work really well', 2, '2023-08-15 13:20:00', 2, 17, 68),
('Any tips for making vegan pasta?', 1, '2023-08-15 13:30:00', 4, 17, NULL),
('Use semolina flour and avoid eggs', 2, '2023-08-15 13:40:00', 2, 17, 70),
('Thanks! I''ll try that', 3, '2023-08-15 13:50:00', 3, 17, 71),

-- Comments for Quantum Machine Learning (article_id: 18)
('This is fascinating! How close are we to practical applications?', 1, '2023-08-20 15:00:00', 4, 18, NULL),
('We''re still in early stages, but progress is rapid', 2, '2023-08-20 15:10:00', 3, 18, 73),
('What are the biggest challenges?', 1, '2023-08-20 15:20:00', 5, 18, NULL),
('Qubit stability and error correction', 2, '2023-08-20 15:30:00', 3, 18, 75),
('Can you recommend any resources for learning more?', 1, '2023-08-20 15:40:00', 6, 18, NULL),
('Check out Xanadu and Rigetti''s websites', 2, '2023-08-20 15:50:00', 3, 18, 77),
('Thanks!', 3, '2023-08-20 16:00:00', 4, 18, 78);

-- Insert sample image records
INSERT INTO imgs (path, article_id) VALUES
('paris1.jpg', 1),
('recipe1.jpg', 2),
('tech1.jpg', 3),
('workout1.jpg', 4),
('fashion1.jpg', 5),
('travel1.jpg', 6),
('book1.jpg', 7),
('music1.jpg', 8),
('climate1.jpg', 9),
('sports1.jpg', 10);

-- Insert new comments for the articles above
INSERT INTO comments (content, layer, date_time, user_id, article_id, parent_cid) VALUES
('Love this insight on London''s lesser-known streets!', 1, '2023-09-01 11:00:00', 1, 19, NULL),
('Any recommendations for budget grocery stores?', 1, '2023-09-02 11:30:00', 8, 20, NULL),
('VR arcades are popping up everywhere, can''t wait to see more!', 1, '2023-09-03 14:30:00', 10, 21, NULL),
('Which desert would you recommend visiting first?', 1, '2023-09-04 10:00:00', 4, 22, NULL),
('What are your favorite neutral color pieces?', 1, '2023-09-05 16:30:00', 7, 23, NULL),
('Try Camden Town for street photography!', 2, '2023-09-01 11:10:00', 5, 19, 79),
('Bulk purchase beans and grains for cost savings.', 2, '2023-09-02 11:40:00', 2, 20, 80);

-- Insert new like records for articles
INSERT INTO like_a (user_id, article_id) VALUES
(3, 1),
(6, 2),
(7, 4),
(8, 5),
(10, 6);

-- Insert new like records for comments
INSERT INTO like_c (user_id, comment_id) VALUES
(2, 79),
(9, 80),
(5, 81),
(1, 82),
(3, 83);


-- Insert admin accounts
INSERT INTO admins (username, pwd) VALUES
('admin', 'admin123'),
('moderator', 'mod123'),
('supervisor', 'super123');

