-- Hotels seed data for all 18 destinations (PostgreSQL)
-- Insert hotel data

INSERT INTO hotels (name, city, stars, price_per_night, description, amenities) VALUES

-- ── DELHI ──────────────────────────────────────────────────────────────
('The Imperial, New Delhi',         'Delhi', 5, 22000, 'Colonial-era landmark hotel steps from Connaught Place with world-class dining.', 'Pool, Spa, 6 Restaurants, Gym, Valet'),
('Taj Mahal Hotel New Delhi',       'Delhi', 5, 18500, 'Iconic luxury hotel in the diplomatic enclave near India Gate.',                  'Pool, Spa, Multiple Restaurants, Butler Service'),
('The Leela Palace New Delhi',      'Delhi', 5, 20000, 'Opulent palace-inspired hotel in Chanakyapuri with stunning garden views.',      'Pool, Spa, Helipad, 5 Restaurants, Gym'),
('ITC Maurya New Delhi',            'Delhi', 5, 16000, 'Flagship ITC property known for its award-winning Bukhara restaurant.',          'Pool, Spa, 4 Restaurants, Business Centre, Gym'),
('Hyatt Regency Delhi',             'Delhi', 4,  7500, 'Contemporary business hotel near Bhikaji Cama Place with large conference spaces.','Pool, Gym, 3 Restaurants, Spa, Rooftop Bar'),
('Radisson Blu Paschim Vihar',      'Delhi', 4,  5200, 'Modern full-service hotel convenient to IGI Airport and west Delhi.',            'Pool, Gym, Restaurant, Bar, Free Parking'),
('Bloom Hotel Janakpuri',           'Delhi', 3,  2800, 'Compact smart hotel with clean rooms and fast Wi-Fi in a residential hub.',      'Wi-Fi, AC, 24-hr Front Desk, Room Service'),

-- ── MUMBAI ─────────────────────────────────────────────────────────────
('The Taj Mahal Palace Mumbai',     'Mumbai', 5, 28000, 'Mumbai''s most iconic hotel overlooking the Gateway of India since 1903.',     'Pool, Spa, 9 Restaurants, Heritage Wing, Butler'),
('The Oberoi Mumbai',               'Mumbai', 5, 24000, 'Contemporary luxury tower in Nariman Point with panoramic Arabian Sea views.', 'Pool, Spa, 4 Restaurants, Personal Concierge, Gym'),
('ITC Grand Central Mumbai',        'Mumbai', 5, 19500, 'Art-deco inspired grand hotel in Parel close to the business district.',       'Pool, Spa, 5 Restaurants, Gym, Meeting Rooms'),
('Trident Nariman Point',           'Mumbai', 5, 16000, 'Elegant seafront hotel with direct access to the Marine Drive promenade.',     'Pool, Spa, 3 Restaurants, Gym, Business Centre'),
('JW Marriott Mumbai Juhu',         'Mumbai', 5, 14500, 'Beachfront luxury hotel in Juhu popular with Bollywood celebrities.',          'Beachfront, Pool, Spa, 6 Restaurants, Gym'),
('Novotel Mumbai Juhu Beach',       'Mumbai', 4,  6800, 'Contemporary hotel on Juhu beach with relaxed family-friendly atmosphere.',    'Pool, Gym, Restaurant, Bar, Beach Access'),
('Ibis Mumbai Airport',             'Mumbai', 3,  3200, 'Smart budget hotel minutes from Chhatrapati Shivaji International Airport.',   'Wi-Fi, AC, Restaurant, 24-hr Front Desk, Shuttle'),

-- ── BANGALORE ──────────────────────────────────────────────────────────
('Taj West End Bengaluru',          'Bangalore', 5, 16000, 'Sprawling heritage property set in 20 acres of gardens in Central Bangalore.','Pool, Spa, 5 Restaurants, Tennis, Gym'),
('The Leela Palace Bengaluru',      'Bangalore', 5, 18500, 'Grand palace hotel near HAL Airport with neo-Dravidian architecture.',       'Pool, Spa, 5 Restaurants, Gym, Helipad'),
('ITC Windsor Bengaluru',           'Bangalore', 5, 14500, 'Distinguished English-style luxury hotel in the heart of the city.',         'Pool, Spa, 4 Restaurants, Gym, Business Lounge'),
('Sheraton Grand Bengaluru',        'Bangalore', 5, 12000, 'Modern luxury hotel in Whitefield tech corridor with expansive facilities.', 'Pool, Spa, 3 Restaurants, Gym, Rooftop Pool'),
('Marriott Hotel Whitefield',       'Bangalore', 4,  7200, 'Upscale business hotel in Whitefield IT Park close to major tech campuses.', 'Pool, Gym, 3 Restaurants, Spa, Business Centre'),
('Lemon Tree Premier Ulsoor Lake',  'Bangalore', 4,  4800, 'Vibrant hotel overlooking Ulsoor Lake with colorful contemporary design.',   'Pool, Gym, Restaurant, Bar, Spa'),
('Ibis Bengaluru Hosur Road',       'Bangalore', 3,  2600, 'Smart budget hotel near Electronics City tech park with reliable Wi-Fi.',    'Wi-Fi, AC, Restaurant, 24-hr Desk, Gym'),

-- ── CHENNAI ────────────────────────────────────────────────────────────
('ITC Grand Chola Chennai',         'Chennai', 5, 17500, 'Magnificent Chola-dynasty inspired hotel — one of Asia''s largest luxury hotels.','Pool, Spa, 9 Restaurants, Gym, Ballroom'),
('Taj Coromandel Chennai',          'Chennai', 5, 15000, 'Classic landmark hotel on Nungambakkam''s upscale hotel row.',                'Pool, Spa, 5 Restaurants, Gym, Heritage Art'),
('The Leela Palace Chennai',        'Chennai', 5, 16500, 'Palatial beachfront hotel on the Bay of Bengal with south Indian aesthetics.', 'Beach, Pool, Spa, 6 Restaurants, Gym'),
('Hyatt Regency Chennai',           'Chennai', 5, 13000, 'Sleek glass tower in the Anna Salai corridor with rooftop infinity pool.',    'Infinity Pool, Spa, 4 Restaurants, Gym, Bar'),
('Radisson Blu GRT Hotel Chennai',  'Chennai', 4,  5500, 'Award-winning airport hotel with seamless connectivity to terminals.',        'Pool, Gym, 3 Restaurants, Spa, Free Airport Transfer'),
('Lemon Tree Hotel Perungudi',      'Chennai', 4,  4200, 'Modern hotel in the IT corridor of OMR with bright cheerful interiors.',      'Pool, Gym, Restaurant, Bar, Meeting Rooms'),
('FabHotel Aparnaa Inn Adyar',      'Chennai', 3,  2400, 'Comfortable mid-range hotel in Adyar close to the beach and ECR.',            'Wi-Fi, AC, Restaurant, 24-hr Desk, Room Service'),

-- ── HYDERABAD ──────────────────────────────────────────────────────────
('Taj Falaknuma Palace',            'Hyderabad', 5, 32000, 'Former Nizam''s palace perched on a hilltop offering unrivalled royal hospitality.','Palace Tours, Spa, 4 Restaurants, Pool, Butler'),
('ITC Kohenur Hyderabad',           'Hyderabad', 5, 17500, 'Ultra-modern luxury hotel in HITECH City designed around sustainable practices.', 'Pool, Spa, 5 Restaurants, Gym, Rooftop Bar'),
('Novotel Hyderabad Convention Centre','Hyderabad',5,12500,'Integrated convention hotel next to HICC Hitex with large event spaces.',  'Pool, Spa, 4 Restaurants, Gym, Convention Centre'),
('Marriott Hyderabad',              'Hyderabad', 5, 14000, 'Upscale Marriott in the financial district steps from major IT offices.',   'Pool, Spa, 3 Restaurants, Gym, Business Lounge'),
('The Park Hyderabad',              'Hyderabad', 4,  6800, 'Design-forward boutique hotel in Somajiguda with vibrant F&B scene.',       'Pool, Gym, 2 Restaurants, Bar, Spa'),
('Lemon Tree Hotel HITEC City',     'Hyderabad', 4,  4500, 'Practical upscale hotel in HITEC City with free shuttle to tech campuses.', 'Pool, Gym, Restaurant, Bar, Business Centre'),
('Treebo Trend Hotel Sanjivaiah',   'Hyderabad', 3,  2200, 'Clean and comfortable budget hotel near Necklace Road and Hussain Sagar.',  'Wi-Fi, AC, 24-hr Desk, Room Service'),

-- ── KOLKATA ────────────────────────────────────────────────────────────
('The Oberoi Grand Kolkata',        'Kolkata', 5, 15500, 'Regal colonial-era hotel on Jawaharlal Nehru Road in the heart of the city.', 'Pool, Spa, 3 Restaurants, Heritage Lounge, Gym'),
('ITC Sonar Kolkata',               'Kolkata', 5, 14000, 'Contemporary ITC property in New Town with access to the Sonar Golf Course.',  'Pool, Spa, Golf, 5 Restaurants, Gym'),
('Taj Bengal Kolkata',              'Kolkata', 5, 16000, 'Landmark luxury hotel in Alipore blending eastern and western aesthetics.',   'Pool, Spa, 5 Restaurants, Gym, Tennis'),
('The Park Kolkata',                'Kolkata', 4,  6200, 'Boutique hotel on Park Street with rooftop Someplace Else bar and diner.',    'Rooftop Bar, Spa, 3 Restaurants, Gym, Pool'),
('Hyatt Regency Kolkata',           'Kolkata', 4,  7000, 'Contemporary hotel in Salt Lake City opposite City Centre Mall.',             'Pool, Spa, 3 Restaurants, Gym, Business Centre'),
('Lemon Tree Hotel Kolkata',        'Kolkata', 4,  4000, 'Cheerful design hotel near New Town knowledge campus in Rajarhat.',           'Pool, Gym, Restaurant, Bar, Meeting Rooms'),
('Mapple Emerald New Town',         'Kolkata', 3,  2500, 'Budget-friendly hotel in Rajarhat action zone with all basic amenities.',     'Wi-Fi, AC, Restaurant, 24-hr Desk, Parking'),

-- ── PUNE ───────────────────────────────────────────────────────────────
('JW Marriott Pune',                'Pune', 5, 15000, 'Magnificent five-star on Senapati Bapat Road — Pune''s top luxury address.',    'Pool, Spa, 5 Restaurants, Gym, Rooftop Bar'),
('Conrad Pune',                     'Pune', 5, 16500, 'Sleek contemporary Conrad property in the Sangamvadi business district.',       'Pool, Spa, 4 Restaurants, Gym, Executive Lounge'),
('The Westin Pune Koregaon Park',   'Pune', 5, 13500, 'Upscale Westin in leafy Koregaon Park with signature Heavenly Beds.',          'Pool, Spa, 4 Restaurants, WestinWorkout Gym, Tennis'),
('Novotel Pune',                    'Pune', 4,  6500, 'Smart business hotel near the Pune airport and Pune IT corridor.',              'Pool, Gym, 2 Restaurants, Bar, Business Centre'),
('Courtyard by Marriott Pune City', 'Pune', 4,  5800, 'Comfortable business hotel in Pune''s Chakan industrial belt.',                'Pool, Gym, Restaurant, Bar, Meeting Rooms'),
('Lemon Tree Hotel Hinjewadi',      'Pune', 4,  4200, 'Vibrant hotel inside Hinjewadi IT Park — steps from India''s silicon valley.', 'Pool, Gym, Restaurant, Bar, Free Shuttle'),
('Hotel Sunderban Pune',            'Pune', 3,  2200, 'Heritage budget hotel near Deccan Gymkhana with old Pune character.',           'Wi-Fi, AC, Restaurant, 24-hr Desk, Parking'),

-- ── AHMEDABAD ──────────────────────────────────────────────────────────
('Hyatt Regency Ahmedabad',         'Ahmedabad', 5, 12000, 'Premier luxury hotel in the SG Highway business corridor.',               'Pool, Spa, 4 Restaurants, Gym, Business Centre'),
('Taj Skyline Ahmedabad',           'Ahmedabad', 5, 11500, 'Modern Taj tower with panoramic views over Ahmedabad''s skyline.',        'Pool, Spa, 4 Restaurants, Gym, Rooftop Lounge'),
('Novotel Ahmedabad',               'Ahmedabad', 4,  6500, 'Contemporary hotel near the GIFT City financial district.',               'Pool, Gym, 3 Restaurants, Bar, Business Centre'),
('The Grand Bhagwati',              'Ahmedabad', 4,  5200, 'Long-standing luxury hotel in Bodakdev favoured for weddings and events.', 'Pool, Banquet Halls, 3 Restaurants, Gym, Spa'),
('Fortune Landmark',                'Ahmedabad', 4,  5000, 'Full-service ITC Fortune hotel near Ahmedabad''s old city and markets.',  'Pool, Gym, 2 Restaurants, Bar, Business Lounge'),
('Lemon Tree Hotel Ahmedabad',      'Ahmedabad', 4,  4500, 'Cheerful upscale hotel in the corporate hub of Vastrapur.',              'Pool, Gym, Restaurant, Bar, Meeting Rooms'),
('Hotel Comfort Inn Sunset',        'Ahmedabad', 3,  2600, 'Reliable mid-range hotel near the Ahmedabad railway station.',            'Wi-Fi, AC, Restaurant, 24-hr Desk, Parking'),

-- ── GOA ────────────────────────────────────────────────────────────────
('Taj Exotica Resort & Spa Goa',    'Goa', 5, 22000, 'Sprawling beachfront resort on Benaulim beach with 56 acres of tropical gardens.','Private Beach, 4 Pools, Spa, 6 Restaurants, Tennis'),
('The Leela Goa',                   'Goa', 5, 19500, 'Luxurious resort on Mobor beach beside the Sal river mouth.',                   'Private Beach, Pools, Spa, 7 Restaurants, Golf'),
('Grand Hyatt Goa',                 'Goa', 5, 17000, 'Palatial resort in Bambolim with one of Goa''s largest outdoor pools.',        'Lagoon Pool, Spa, 6 Restaurants, Gym, Tennis'),
('W Goa',                           'Goa', 5, 24000, 'Ultra-chic beachfront W property on Vagator beach with buzzing nightlife.',    'Beach, 2 Pools, Spa, 5 Restaurants, W Lounge'),
('Alila Diwa Goa',                  'Goa', 5, 16000, 'Boutique luxury resort in the South Goa rice paddies and village landscape.',  'Pool, Spa, 3 Restaurants, Cycling, Cultural Tours'),
('DoubleTree by Hilton Goa',        'Goa', 4,  7500, 'Contemporary full-service resort hotel near Arpora''s Saturday Night Market.', 'Pool, Gym, 3 Restaurants, Bar, Spa'),
('Lemon Tree Amarante Beach Resort','Goa', 4,  5200, 'Bright and cheerful beach resort in Candolim close to Fort Aguada.',           'Beach Access, Pool, Gym, Restaurant, Bar'),
('Zostel Goa Colva',                'Goa', 3,  1800, 'Vibrant backpacker hostel and private rooms near Colva beach, Goa.',           'Beach Access, Common Kitchen, Social Lounge, Wi-Fi'),

-- ── JAIPUR ─────────────────────────────────────────────────────────────
('Rambagh Palace',                  'Jaipur', 5, 38000, 'Former residence of the Maharaja of Jaipur — the jewel in Taj''s crown.',   'Pool, Spa, 7 Restaurants, Polo Ground, Butler'),
('Taj Jai Mahal Palace',            'Jaipur', 5, 22000, 'Regal 18th-century palace hotel set in 18 acres of Mughal gardens.',        'Pool, Spa, 4 Restaurants, Gym, Heritage Walks'),
('The Oberoi Rajvilas',             'Jaipur', 5, 35000, 'Award-winning luxury villa resort outside Jaipur with tented suites.',      'Pool, Spa, 3 Restaurants, Peacock Garden, Butler'),
('ITC Rajputana Jaipur',            'Jaipur', 5, 14500, 'Grand Rajput-inspired hotel on Palace Road near the walled pink city.',     'Pool, Spa, 4 Restaurants, Gym, Business Centre'),
('Marriott Jaipur',                 'Jaipur', 4,  7800, 'Contemporary Marriott in Tonk Road''s commercial district.',               'Pool, Spa, 3 Restaurants, Gym, Rooftop Pool'),
('Radisson Hotel Jaipur City Centre','Jaipur',4,  5500, 'Modern upscale hotel in MI Road close to shopping and heritage sites.',     'Pool, Gym, 2 Restaurants, Bar, Meeting Rooms'),
('Hotel Pearl Palace',              'Jaipur', 3,  2200, 'Highly rated budget hotel in Hathroi Fort area with rooftop terrace.',      'Rooftop Café, Wi-Fi, Heritage Décor, 24-hr Desk'),

-- ── AGRA ───────────────────────────────────────────────────────────────
('The Oberoi Amarvilas',            'Agra', 5, 42000, 'India''s finest luxury hotel — every room has an unobstructed Taj Mahal view.','Taj Mahal Views, Pool, Spa, 3 Restaurants, Butler'),
('ITC Mughal Agra',                 'Agra', 5, 18500, 'Grand Mughal-architecture hotel set in 35 acres of Char Bagh gardens.',      'Pool, Spa, 5 Restaurants, Gym, Tennis'),
('Taj Hotel & Convention Centre',   'Agra', 5, 16000, 'Modern Taj property in Taj Nagri Phase II close to the Taj Mahal east gate.','Pool, Spa, 4 Restaurants, Convention Centre, Gym'),
('Trident Agra',                    'Agra', 5, 12000, 'Elegant resort with pink sandstone architecture near the Eastern Gate.',      'Pool, Spa, 3 Restaurants, Gym, Heritage Walks'),
('Radisson Agra',                   'Agra', 4,  5800, 'Contemporary business-friendly hotel near Agra Cantt railway station.',      'Pool, Gym, 2 Restaurants, Bar, Business Centre'),
('Hotel Amar Agra',                 'Agra', 4,  4200, 'Well-regarded hotel close to Taj Mahal with partial monument views.',        'Pool, Restaurant, Bar, Wi-Fi, Parking'),
('Hotel Sheela Agra',               'Agra', 3,  2000, 'Beloved budget property with a lush garden just behind the Taj Mahal.',      'Garden, Restaurant, Wi-Fi, 24-hr Desk, Laundry'),

-- ── VARANASI ───────────────────────────────────────────────────────────
('BrijRama Palace',                 'Varanasi', 5, 18000, '250-year-old heritage palace hotel on the Ganges ghat — unmatched river views.','Ghat Views, Spa, 3 Restaurants, Yoga, Boat Rides'),
('Taj Ganges Varanasi',             'Varanasi', 5, 14500, 'Taj''s flagship Varanasi property set in 40 acres of landscaped gardens.', 'Pool, Spa, 4 Restaurants, Gym, Aarti Tours'),
('Ramada by Wyndham Varanasi',      'Varanasi', 4,  6000, 'Dependable upscale hotel in the Cantonment area with modern facilities.',  'Pool, Gym, Restaurant, Bar, Business Centre'),
('Radisson Hotel Varanasi',         'Varanasi', 4,  5500, 'Contemporary hotel near the Varanasi Junction railway station.',           'Pool, Gym, 2 Restaurants, Bar, Meeting Rooms'),
('Hotel Surya Varanasi',            'Varanasi', 4,  4000, 'Well-established hotel near the Lanka area with rooftop Ganga views.',     'Rooftop Restaurant, Pool, Spa, Bar, Wi-Fi'),
('Guleria Kothi Varanasi',          'Varanasi', 3,  2800, 'Intimate heritage boutique with personalized service on the ghats.',       'Ghat Views, Wi-Fi, Breakfast, Boat Rides, Garden'),
('Hotel Alka Varanasi',             'Varanasi', 3,  1800, 'Simple comfortable hotel steps from Meer Ghat with direct ganga access.',  'Ghat Access, Wi-Fi, AC, 24-hr Desk, Restaurant'),

-- ── RISHIKESH ──────────────────────────────────────────────────────────
('Ananda in the Himalayas',         'Rishikesh', 5, 35000, 'India''s premier luxury spa resort on a Himalayan foothill above Rishikesh.','Spa, Yoga, 3 Restaurants, Pool, Ayurveda Centre'),
('Taj Rishikesh Resort & Spa',      'Rishikesh', 5, 22000, 'Riverside luxury resort surrounded by sal forests on the Ganges bank.',   'Ganges Views, Pool, Spa, 4 Restaurants, Yoga'),
('Aloha on the Ganges',             'Rishikesh', 4,  8500, 'Popular riverside hotel with adventure sports access in Muni Ki Reti.',   'Ganges View, Pool, Yoga, 2 Restaurants, Rafting'),
('Ritz Classic Rishikesh',          'Rishikesh', 4,  6500, 'Comfortable modern hotel near the main Rishikesh market and ghats.',      'Pool, Gym, Restaurant, Bar, Wi-Fi'),
('Ganga Beach Resort',              'Rishikesh', 3,  3500, 'Rustic beachfront camp resort on a secluded Ganges stretch.',             'Private Beach, Bonfire, Restaurant, Yoga, Rafting'),
('Hotel Surya Rishikesh',           'Rishikesh', 3,  2400, 'Centrally located budget hotel near Triveni Ghat and Ram Jhula bridge.',  'Wi-Fi, AC, Restaurant, 24-hr Desk, Parking'),
('Zostel Rishikesh',                'Rishikesh', 3,  1200, 'Popular backpacker hostel with private rooms near Lakshman Jhula.',       'Rooftop Café, Social Lounge, Wi-Fi, Rafting Tours'),

-- ── DARJEELING ─────────────────────────────────────────────────────────
('Glenburn Tea Estate',             'Darjeeling', 5, 24000, 'Exclusive colonial tea estate boutique with only 8 suites and panoramic Kangchenjunga views.','Kangchenjunga Views, Tea Walks, Spa, Dining, Butler'),
('Windamere Hotel Darjeeling',      'Darjeeling', 5, 18000, 'Legendary Victorian-era hotel on Observatory Hill dating back to the 1880s.','Himalaya Views, Heritage Dining, Garden, Library'),
('Mayfair Darjeeling',              'Darjeeling', 5, 14500, 'Heritage hill-station hotel in the former summer residence of the Maharaja of Nazargunj.','Pool, Spa, Heritage Restaurant, Garden, Gym'),
('Elgin Hotels Darjeeling',         'Darjeeling', 4,  7500, 'Charming heritage hotel in a colonial Raj-era building with mountain views.','Mountain Views, Heritage Dining, Garden, Wi-Fi'),
('New Elgin Hotel Darjeeling',      'Darjeeling', 4,  6000, 'Well-regarded heritage property close to Chowrasta Mall and the toy train.',  'Heritage Dining, Garden, Bar, Wi-Fi, 24-hr Desk'),
('Hotel Sinclair''s Darjeeling',    'Darjeeling', 4,  5200, 'Classic hill-station hotel with panoramic valley views from every room.','Himalaya Views, Restaurant, Bar, Wi-Fi, Parking'),
('Hotel Dreamland Darjeeling',      'Darjeeling', 3,  2200, 'Budget-friendly hotel close to Darjeeling bazaar and the toy train station.','Wi-Fi, AC, Restaurant, 24-hr Desk, Mountain Views'),

-- ── LADAKH ─────────────────────────────────────────────────────────────
('The Grand Dragon Ladakh',         'Ladakh', 5, 16000, 'Ladakh''s premier luxury hotel in Leh with dramatic Stok Kangri mountain views.','Mountain Views, Spa, 3 Restaurants, Gym, Roof Deck'),
('Nimmu House Ladakh',              'Ladakh', 4, 12000, 'Eco-luxury lodge in Nimmu village beside the Indus river in a spectacular gorge.','Indus Views, Organic Dining, Cultural Tours, Bonfire'),
('Stok Palace Heritage Hotel',      'Ladakh', 4,  9500, 'Royal palace of the Namgyal dynasty offering authentic Ladakhi heritage stays.',  'Palace Tours, Heritage Dining, Mountain Views, Wi-Fi'),
('Hotel Ladakh Greens',             'Ladakh', 4,  6500, 'Comfortable hotel in Leh bazaar with well-appointed rooms and local restaurant.','Mountain Views, Restaurant, Wi-Fi, 24-hr Desk'),
('The Zen Ladakh',                  'Ladakh', 4,  7800, 'Boutique property in a traditional mud-brick Ladakhi house with modern amenities.','Mountain Views, Organic Garden, Wi-Fi, Rooftop'),
('Kaal Boutique Hotel',             'Ladakh', 3,  3500, 'Small modern guesthouse in central Leh walking distance to the main market.',    'Wi-Fi, AC, Restaurant, 24-hr Desk, Bike Rental'),
('Gomang Boutique Hotel',           'Ladakh', 3,  2800, 'Affordable guesthouse with traditional Ladakhi interiors near Leh palace.',      'Wi-Fi, Traditional Décor, Restaurant, Rooftop, Tours'),

-- ── MANALI ─────────────────────────────────────────────────────────────
('Manuallaya Resort Spa Manali',    'Manali', 5, 18000, 'Luxury Himalayan resort in the Kullu Valley on the banks of the Beas river.',  'Beas Views, Spa, Pool, 3 Restaurants, Yoga'),
('Span Resort & Spa Manali',        'Manali', 5, 15000, 'Secluded riverside retreat in the apple orchards between Manali and Kullu.',    'River Views, Spa, Pool, 2 Restaurants, Trekking'),
('Solang Valley Resort',            'Manali', 5, 14000, 'Adventure resort near Solang Valley with Rohtang Pass access and snow views.',  'Mountain Views, Pool, Spa, Restaurant, Skiing'),
('The Orchard Greens',              'Manali', 4,  8500, 'Charming apple-orchard property with wooden cottage-style rooms and snow views.','Mountain Views, Restaurant, Bonfire, Wi-Fi, Trekking'),
('Holiday Inn Manali',              'Manali', 4,  7200, 'Full-service modern hotel in Old Manali with panoramic Kullu valley views.',    'Pool, Gym, Restaurant, Bar, Business Centre'),
('Snow Valley Resorts',             'Manali', 4,  6500, 'Comfortable resort hotel close to Hadimba Temple and the old village market.',  'Mountain Views, Restaurant, Bonfire, Wi-Fi, Ski Gear'),
('Hotel Rohtang Manor',             'Manali', 3,  2800, 'Budget mountain hotel with valley views close to Manali bus station.',          'Mountain Views, Wi-Fi, Restaurant, 24-hr Desk'),

-- ── KOCHI ──────────────────────────────────────────────────────────────
('Taj Malabar Resort & Spa Kochi',  'Kochi', 5, 18500, 'Historic luxury hotel on Willingdon Island with panoramic backwater views.',   'Pool, Spa, 5 Restaurants, Heritage Walk, Gym'),
('The Brunton Boatyard',            'Kochi', 5, 17000, 'Heritage boutique hotel in a restored 19th-century boatyard in Fort Kochi.',   'Harbour Views, Heritage Dining, Pool, Spa, Tours'),
('Vivanta Kochi Ernakulam',         'Kochi', 5, 15000, 'Contemporary Vivanta on Marine Drive overlooking Vembanad Lake.',              'Lake Views, Pool, Spa, 4 Restaurants, Gym'),
('Le Meridien Kochi',               'Kochi', 5, 14000, 'Striking contemporary hotel in the heart of Ernakulam city.',                  'Pool, Spa, 3 Restaurants, Gym, Rooftop Bar'),
('Radisson Blu Ernakulam',          'Kochi', 4,  6000, 'Modern upscale hotel near the Ernakulam Junction railway station.',            'Pool, Gym, 2 Restaurants, Bar, Business Centre'),
('Lemon Tree Premier Kochi',        'Kochi', 4,  4800, 'Smart contemporary hotel steps from MG Road shopping district.',               'Pool, Gym, Restaurant, Bar, Meeting Rooms'),
('Forte Kochi Hotel',               'Kochi', 3,  2600, 'Charming heritage boutique in the lanes of Fort Kochi near Chinese fishing nets.','Heritage Décor, Restaurant, Wi-Fi, Cultural Tours'),

-- ── MYSORE ─────────────────────────────────────────────────────────────
('Lalitha Mahal Palace Hotel',      'Mysore', 5, 14000, 'Iconic white palace hotel built in 1921 for the Viceroy of India in Chamundi Hills.','Palace Tours, Pool, Heritage Dining, Garden, Gym'),
('Radisson Blu Plaza Hotel Mysore', 'Mysore', 5, 10500, 'Upscale Radisson Blu on the Bangalore-Mysore highway near the palace.',       'Pool, Spa, 4 Restaurants, Gym, Business Centre'),
('The Windflower Resort & Spa',     'Mysore', 4,  7800, 'Charming boutique resort surrounded by flower gardens near the racecourse.',  'Pool, Spa, 2 Restaurants, Yoga, Cycling'),
('Fortune JP Palace Mysore',        'Mysore', 4,  5500, 'Central business hotel close to the Mysore railway station and city centre.', 'Pool, Gym, 2 Restaurants, Bar, Meeting Rooms'),
('Treebo Regenta Central Mysore',   'Mysore', 4,  4200, 'Contemporary hotel in the commercial hub near the Mysore palace and markets.','Pool, Restaurant, Bar, Wi-Fi, 24-hr Desk'),
('Hotel Roopa Mysore',              'Mysore', 3,  2400, 'Well-located mid-range hotel in the heart of Mysore near the Devaraja Market.','Wi-Fi, AC, Restaurant, 24-hr Desk, Parking'),
('Hotel Dasaprakash Mysore',        'Mysore', 3,  1800, 'Classic South Indian budget hotel famous for its vegetarian restaurant.',     'South Indian Restaurant, Wi-Fi, AC, 24-hr Desk');
