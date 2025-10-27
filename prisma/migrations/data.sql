SET session_replication_role = replica;
BEGIN;
TRUNCATE TABLE 
public.analytics_events, 
public.audit_logs, 
public.cart_items, 
public.carts, 
public.categories, 
public.coupons, 
public.delivery_cities, 
public.drivers, 
public.guest_sessions, 
public.hero_slides, 
public.newsletter_subscriptions, 
public.order_items, 
public.orders, 
public.payments, 
public.pickup_locations, 
public.product_tags, 
public.product_variants, 
public.products, 
public.refunds, 
public.returns, 
public.reviews, 
public.settings, 
public.shipping_addresses, 
public.stock_alerts, 
public.tags, 
public.translation_cache, 
public.users, 
public.wishlist_items, 
public.wishlists 
CASCADE;




--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: avnadmin
--



--
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.analytics_events (id, event_type, user_id, product_id, order_id, metadata, created_at) FROM stdin;
cmehmyv5h001mi9kg77oyk8tm	SIGN_IN	\N	\N	\N	{"category": "cmehmytgz000hi9kgru79puuo"}	2025-08-03 07:24:29.082
cmehmyv5h001oi9kggxleikhn	PRODUCT_VIEW	cmehmyrxo0000i9kgmqs45ovs	\N	\N	{"category": "cmehmytah000ei9kgxmpe8nzi", "productId": "cmehmyuey000vi9kg3lbtyifx"}	2025-08-06 03:26:31.451
cmehmyv5h001ji9kgirn15c27	FILTER	cmehmyrxo0000i9kgmqs45ovs	\N	\N	{"category": "cmehmytnd000ki9kgx04p979z"}	2025-08-15 07:28:28.467
cmehmyv5h001ni9kgno93n7wn	PURCHASE	cmehmys0w0001i9kgemb7pnli	\N	\N	{"value": 79.99, "category": "cmehmytgz000hi9kgru79puuo"}	2025-08-07 12:36:06.583
cmehmyv5h001li9kg8osyu5i5	PAGE_VIEW	\N	\N	\N	{"category": "cmehmytnd000ki9kgx04p979z"}	2025-07-26 17:08:44.748
cmehmyv5i001wi9kgnmenjlf9	SIGN_IN	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	\N	\N	{"category": "cmehmytgz000hi9kgru79puuo"}	2025-08-03 05:56:29.624
cmehmyv5i001qi9kgdy1u315r	FILTER	\N	\N	\N	{"category": "cmehmytnd000ki9kgx04p979z"}	2025-08-01 06:45:32.024
cmehmyv5i001ti9kgjslzwljf	PAGE_VIEW	cmehmys0w0001i9kgemb7pnli	\N	\N	{"category": "cmehmytah000ei9kgxmpe8nzi"}	2025-07-31 07:35:00.037
cmehmyv5i001ui9kgpi0evc5b	PAGE_VIEW	\N	\N	\N	{"category": "cmehmytqi000li9kg6g7o79ze"}	2025-08-16 06:40:17.398
cmehmyv5i001vi9kgysyp813d	PRODUCT_VIEW	cmehmyskt0003i9kguik3xua5	\N	\N	{"category": "cmehmytah000ei9kgxmpe8nzi", "productId": "cmehmyufd0015i9kg4t8rvemm"}	2025-08-16 01:59:54.062
cmehmyvbn001yi9kgwdo3llxa	PAGE_VIEW	cmehmys0w0001i9kgemb7pnli	\N	\N	{"category": "cmehmytgz000hi9kgru79puuo"}	2025-08-13 15:09:03.666
cmehmyvbp0022i9kgzlv72kmr	SIGN_UP	\N	\N	\N	{"category": "cmehmytqi000li9kg6g7o79ze"}	2025-08-13 14:59:26.712
cmehmyvbr0024i9kgse56c2ei	PRODUCT_VIEW	\N	\N	\N	{"category": "cmehmytah000ei9kgxmpe8nzi", "productId": "cmehmyufd0015i9kg4t8rvemm"}	2025-08-02 02:39:47.942
cmehmyvbu0027i9kgdfayj7om	SIGN_IN	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	\N	\N	{"category": "cmehmytqi000li9kg6g7o79ze"}	2025-07-28 20:53:57.469
cmehmyvbu0028i9kgdgg0cbyp	FILTER	\N	\N	\N	{"category": "cmehmytah000ei9kgxmpe8nzi"}	2025-07-31 20:41:33.941
cmehmyvbv002ai9kg1x92hnuu	SEARCH	cmehmys0w0001i9kgemb7pnli	\N	\N	{"category": "cmehmytnd000ki9kgx04p979z", "productId": "cmehmyufa0011i9kgswg6y9bi"}	2025-07-22 12:02:43.38
cmehmyvbo001zi9kgzzsqwpyn	PAGE_VIEW	\N	\N	\N	{"category": "cmehmyt46000ci9kgpm2toj3n"}	2025-08-05 00:49:52.119
cmehmyvbp0023i9kg9rbk72v9	PAGE_VIEW	cmehmys0w0001i9kgemb7pnli	\N	\N	{"category": "cmehmytk5000ji9kgl25bl4zw"}	2025-07-20 07:27:02.757
cmehmyvbs0025i9kg8g7lw9sy	ADD_TO_CART	\N	\N	\N	{"category": "cmehmytnd000ki9kgx04p979z", "productId": "cmehmyufa0011i9kgswg6y9bi"}	2025-07-25 00:31:12.516
cmehmyvbp0020i9kgmvl2en7k	SIGN_UP	\N	\N	\N	{"category": "cmehmytah000ei9kgxmpe8nzi"}	2025-08-05 10:34:48.692
cmehmyvey002ei9kg3f0ja4s8	FILTER	\N	\N	\N	{"category": "cmehmytgz000hi9kgru79puuo"}	2025-08-02 07:48:30.252
cmehmyveq002bi9kg73x7f5n7	PURCHASE	\N	\N	\N	{"value": 49.99, "category": "cmehmytgz000hi9kgru79puuo"}	2025-08-07 05:20:07.119
cmehmyvhx002ji9kgt8a72mgr	PAGE_VIEW	\N	\N	\N	{"category": "cmehmytgz000hi9kgru79puuo"}	2025-07-24 10:40:37.938
cmehmyvhz002li9kg44sj6qx3	ADD_TO_CART	cmehmyrxo0000i9kgmqs45ovs	\N	\N	{"category": "cmehmytnd000ki9kgx04p979z", "productId": "cmehmyufa0011i9kgswg6y9bi"}	2025-07-19 23:26:59.9
cmehmyvhz002ni9kgup4bq69d	SIGN_UP	cmehmyskj0002i9kgkl0mquew	\N	\N	{"category": "cmehmytgz000hi9kgru79puuo"}	2025-08-18 03:50:51.533
cmehmyvi1002oi9kgdi13nif6	PAGE_VIEW	\N	\N	\N	{"category": "cmehmytnd000ki9kgx04p979z"}	2025-08-01 12:29:13.834
cmehmyvey002fi9kgwtjzwedo	ADD_TO_CART	\N	\N	\N	{"category": "cmehmyt46000ci9kgpm2toj3n", "productId": "cmehmyuew000ti9kgooiqhhuq"}	2025-07-28 22:10:40.38
cmehmyvez002hi9kgwfo0j3ah	PRODUCT_VIEW	cmehmys0w0001i9kgemb7pnli	\N	\N	{"category": "cmehmytk5000ji9kgl25bl4zw", "productId": "cmehmytvo000qi9kg5ygnzimm"}	2025-08-16 05:52:47.399
cmehmyvi2002pi9kgfxsiud2w	PRODUCT_VIEW	\N	\N	\N	{"category": "cmehmytgz000hi9kgru79puuo", "productId": "cmehmytvp000ri9kg1015mf1i"}	2025-08-16 18:18:43.998
cmehmyvey002di9kg6yui486e	PRODUCT_VIEW	cmehmyskt0003i9kguik3xua5	\N	\N	{"category": "cmehmyt46000ci9kgpm2toj3n", "productId": "cmehmytvo000pi9kgcuq1x6z0"}	2025-07-25 05:37:00.127
cmehmyvf0002ii9kg4d7clvu4	FILTER	\N	\N	\N	{"category": "cmehmyt46000ci9kgpm2toj3n"}	2025-07-23 13:49:38.624
cmehmyvl0002ti9kggak9uln8	SIGN_UP	cmehmyskt0003i9kguik3xua5	\N	\N	{"category": "cmehmytk5000ji9kgl25bl4zw"}	2025-08-10 11:22:48.262
cmehmyvl0002si9kgnusue67b	PAGE_VIEW	cmehmyskt0003i9kguik3xua5	\N	\N	{"category": "cmehmyt46000ci9kgpm2toj3n"}	2025-08-15 17:56:32.414
cmehmyvl1002vi9kg0lxbyg8r	PURCHASE	cmehmyrxo0000i9kgmqs45ovs	\N	\N	{"value": 79.99, "category": "cmehmytqi000li9kg6g7o79ze"}	2025-07-26 12:47:42.915
cmehmyvl2002xi9kgoyjdxbm0	SEARCH	cmehmyskt0003i9kguik3xua5	\N	\N	{"category": "cmehmytnd000ki9kgx04p979z", "productId": "cmehmyufc0013i9kgrecuojij"}	2025-07-26 14:10:43.913
cmehmyvl2002zi9kg1s7uhsci	ADD_TO_CART	cmehmyrxo0000i9kgmqs45ovs	\N	\N	{"category": "cmehmytgz000hi9kgru79puuo", "productId": "cmehmytvp000ri9kg1015mf1i"}	2025-07-29 06:24:35.139
cmehmyvl30031i9kghtkeh33l	FILTER	cmehmyskt0003i9kguik3xua5	\N	\N	{"category": "cmehmytnd000ki9kgx04p979z"}	2025-07-27 01:16:06.351
cmehmyvl30033i9kgu2nys7ej	ADD_TO_CART	cmehmys0w0001i9kgemb7pnli	\N	\N	{"category": "cmehmytqi000li9kg6g7o79ze", "productId": "cmehmyuf8000zi9kgsu5rm18f"}	2025-07-26 09:11:16.6
cmehmyvl40036i9kgyi5k5mby	ADD_TO_CART	\N	\N	\N	{"category": "cmehmytnd000ki9kgx04p979z", "productId": "cmehmyufc0013i9kgrecuojij"}	2025-07-21 20:01:40.251
cmehmyvlb0037i9kgewmb6peu	ADD_TO_CART	\N	\N	\N	{"category": "cmehmyt46000ci9kgpm2toj3n", "productId": "cmehmytvo000pi9kgcuq1x6z0"}	2025-08-09 19:54:23.739
cmehmyvo20039i9kg2gx0lr3n	SIGN_IN	cmehmyrxo0000i9kgmqs45ovs	\N	\N	{"category": "cmehmytgz000hi9kgru79puuo"}	2025-08-12 21:50:25.955
cmehmyvo3003di9kg0tavq0ab	SIGN_UP	cmehmyskj0002i9kgkl0mquew	\N	\N	{"category": "cmehmytqi000li9kg6g7o79ze"}	2025-08-06 07:37:26.727
cmehmyvo3003bi9kguthdl1o3	FILTER	cmehmys0w0001i9kgemb7pnli	\N	\N	{"category": "cmehmytgz000hi9kgru79puuo"}	2025-07-30 14:28:29.235
cmehmyvo3003ei9kgs8jiumgh	PURCHASE	\N	\N	\N	{"value": 2499.99, "category": "cmehmytah000ei9kgxmpe8nzi"}	2025-07-29 10:28:58.994
cmehmyvo6003gi9kgignpep1j	SEARCH	cmehmys0w0001i9kgemb7pnli	\N	\N	{"category": "cmehmytqi000li9kg6g7o79ze", "productId": "cmehmyuf8000zi9kgsu5rm18f"}	2025-07-23 11:28:00.724
cmehmyvl40035i9kg6f33lys6	PURCHASE	cmehmyskt0003i9kguik3xua5	\N	\N	{"value": 199.99, "category": "cmehmytnd000ki9kgx04p979z"}	2025-08-06 12:48:02.006
cmehmyvo6003ii9kgsc6j70o0	SEARCH	cmehmyrxo0000i9kgmqs45ovs	\N	\N	{"category": "cmehmytah000ei9kgxmpe8nzi", "productId": "cmehmyuey000vi9kg3lbtyifx"}	2025-08-04 02:18:36.416
cmehmyvoo003ki9kgyj389x2g	ADD_TO_CART	cmehmyrxo0000i9kgmqs45ovs	\N	\N	{"category": "cmehmytah000ei9kgxmpe8nzi", "productId": "cmehmyuey000vi9kg3lbtyifx"}	2025-08-08 16:13:25.271
cmehmyvot003li9kg9hyoqfie	SIGN_IN	\N	\N	\N	{"category": "cmehmytqi000li9kg6g7o79ze"}	2025-08-07 03:16:41.619
cmehmyvpr003ni9kgl5qwm99b	SIGN_UP	cmehmys0w0001i9kgemb7pnli	\N	\N	{"category": "cmehmytah000ei9kgxmpe8nzi"}	2025-08-08 13:14:28.196
\.



--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, created_at, ip_address, user_agent, user_email) FROM stdin;
cmehmyvw0003ri9kgi4v31kcg	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	CREATE	Product	cmehmytvo000pi9kgcuq1x6z0	\N	{"name": "iPhone 15 Pro", "price": 999.99}	2025-08-11 21:37:46.991	\N	\N	\N
cmehmyvw0003si9kgpnxtllm6	cmehmyrxo0000i9kgmqs45ovs	UPDATE	Product	cmehmyuew000ti9kgooiqhhuq	{"stock": 20}	{"stock": 18}	2025-08-16 21:37:46.991	\N	\N	\N
                                                                                                                                                                                                                                                                            cmehmyvw0003ti9kg5b472ckm	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	CREATE	Category	cmehmysxn000ai9kgkel8bzbl	\N	{"name": "Electronics", "slug": "electronics"}	2025-08-08 21:37:46.991	\N	\N	\N
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.cart_items (id, cart_id, product_id, quantity, unit_price, name, image, color, size, created_at, updated_at) FROM stdin;
cmequ7iku0005kv04vfar2a14	cmequ7ia10003kv04lsdhm604	cmehmytvo000pi9kgcuq1x6z0	1	999.99	iPhone 15 Pro	/iphone-15-pro-front.png	\N	\N	2025-08-25 08:10:22.542	2025-08-25 08:10:22.542
cmequ7ome0007kv041oj1cu1a	cmequ7ia10003kv04lsdhm604	cmehmytvo000qi9kg5ygnzimm	1	89.99	Floral Summer Dress	/womens-floral-dress.png	\N	\N	2025-08-25 08:10:30.374	2025-08-25 08:10:30.374
cmequ84hy0009kv043jrwz6no	cmequ7ia10003kv04lsdhm604	cmehmyuf8000zi9kgsu5rm18f	1	79.99	Anti-Aging Serum	/anti-aging-serum.png	\N	\N	2025-08-25 08:10:50.95	2025-08-25 08:10:50.95
cmh4vn8930001j5zpdtz5bhk4	cmeixeoiw0001i9448jnt73ef	cmehmyuf8000zi9kgsu5rm18f	2	79.99	Anti-Aging Serum	https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/686a97840009e6290f0e/view?project=67e9a1fb0011521efac7	\N	\N	2025-10-24 13:18:46.407	2025-10-24 13:18:46.407
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.carts (id, user_id, created_at, updated_at, deleted_at) FROM stdin;
cmeixeoiw0001i9448jnt73ef	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	2025-08-19 19:17:46.277	2025-08-19 19:17:46.277	\N
cmequ7ia10003kv04lsdhm604	user_31lquR7NEj0nv7HLtmbIjVu4nHh	2025-08-25 08:10:22.153	2025-08-25 08:10:22.153	\N
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.categories (id, name, slug, image, description, parent_id, created_at, updated_at, deleted_at, is_active, is_featured, seo_description, seo_title, sort_order) FROM stdin;
cmehmytnd000ki9kgx04p979z	Home & Kitchen	home-kitchen	https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/686a96e1000f258f77ce/view?project=67e9a1fb0011521efac7	Everything for your home and kitchen needs	\N	2025-08-18 21:37:44.089	2025-09-17 11:26:56.015	\N	t	f	\N	\N	0
cmehmyt46000ci9kgpm2toj3n	Smartphones	smartphones	/modern-smartphones.png	Latest smartphones and mobile devices	cmehmysxn000ai9kgkel8bzbl	2025-08-18 21:37:43.398	2025-08-18 21:37:43.398	\N	t	f	\N	\N	0
cmehmytgz000hi9kgru79puuo	Men's Clothing	mens-clothing	/mens-clothing-display.png	Stylish clothing for men	cmehmytdp000fi9kg4cfcbc0a	2025-08-18 21:37:43.859	2025-08-18 21:37:43.859	\N	t	f	\N	\N	0
cmehmytk5000ji9kgl25bl4zw	Women's Clothing	womens-clothing	/womens-clothing.png	Fashion-forward clothing for women	cmehmytdp000fi9kg4cfcbc0a	2025-08-18 21:37:43.974	2025-08-18 21:37:43.974	\N	t	f	\N	\N	0
cmehmytah000ei9kgxmpe8nzi	Laptops	laptops	https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68b077cc0000a6d1306e/view?project=67e9a1fb0011521efac7	Powerful laptops for work and gaming	cmehmysxn000ai9kgkel8bzbl	2025-08-18 21:37:43.625	2025-09-17 11:27:10.187	\N	t	f	\N	\N	0
cmehmytqi000li9kg6g7o79ze	Beauty & Personal Care	beauty-personal-care	https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/686a97820035a3314fc1/view?project=67e9a1fb0011521efac7	Beauty products and personal care items	\N	2025-08-18 21:37:44.203	2025-09-17 09:14:07.666	\N	t	f	\N	\N	0
cmehmysxn000ai9kgkel8bzbl	Electronics	electronics	https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68ca85ae0015c3e8a27f/view?project=67e9a1fb0011521efac7	Latest technology and electronic devices	\N	2025-08-18 21:37:43.163	2025-09-17 09:57:24.636	\N	t	f	\N	\N	0
cmehmytdp000fi9kg4cfcbc0a	Fashion	fashion	https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/686a96e4002daee8ba45/view?project=67e9a1fb0011521efac7	Trendy clothing and accessories	\N	2025-08-18 21:37:43.741	2025-09-17 11:25:15.18	\N	t	f	\N	\N	0
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.coupons (id, code, type, value, min_purchase, max_discount, start_date, end_date, usage_limit, usage_count, is_active, created_at, updated_at, deleted_at, category_id, product_id, description, per_user_limit) FROM stdin;
cmh51dey4000aj5esjzz0xpqm	55555	fixed_amount	20.00	100.00	5.00	2025-10-24 00:00:00	2025-10-30 00:00:00	3	0	t	2025-10-24 15:59:06.22	2025-10-24 15:59:06.22	\N	\N	\N	\N	\N
\.


--
-- Data for Name: delivery_cities; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.delivery_cities (id, name, door_fee, is_active, created_at, updated_at) FROM stdin;
cmekgw95w0002i9ksld3h58q4	Accra	40.00	t	2025-08-20 21:11:05.061	2025-10-23 12:20:21.033
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.drivers (id, name, phone, email, license_no, vehicle_type, vehicle_no, is_active, rating, total_trips, created_at, updated_at) FROM stdin;
cmh2085dy0000j572c3hhvswg	Godfred Amenano	0593024818	testpjmail@gmail.com	9789	bike	7890	t	\N	0	2025-10-22 13:03:42.406	2025-10-22 13:03:42.406
\.


--
-- Data for Name: guest_sessions; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.guest_sessions (id, session_id, email, cart_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: hero_slides; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.hero_slides (id, title, subtitle, image, is_active, sort_order, created_at, updated_at, "buttonLink", "buttonText", color, description) FROM stdin;
cmehmyulv0017i9kgzt4vm67n	Latest iPhone 15 Pro	\N	/iphone-15-pro-hero.png	t	0	2025-08-18 21:37:45.331	2025-08-18 21:37:45.331	/products/iphone-15-pro	Shop Now	#007AFF	Experience the most advanced iPhone with titanium design and A17 Pro chip
cmehmyulv0016i9kgxjq9hr3k	Summer Fashion Collection	\N	/summer-fashion-collection.png	t	0	2025-08-18 21:37:45.331	2025-08-18 21:37:45.331	/categories/fashion	Explore Collection	#FF6B6B	Discover our latest summer styles with up to 50% off selected items
cmehmyulv0018i9kgf2q3pqrd	Smart Home Essentials	\N	/smart-home-devices.png	t	0	2025-08-18 21:37:45.331	2025-08-18 21:37:45.331	/categories/home-kitchen	Learn More	#4ECDC4	Transform your home with our intelligent appliances and devices
\.


--
-- Data for Name: newsletter_subscriptions; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.newsletter_subscriptions (id, email, name, is_active, subscribed_at, unsubscribed_at, created_at, updated_at) FROM stdin;
cmh65wrnf0000kz09cdej14td	testpjmail@gmail.com	\N	t	2025-10-25 10:53:53.786	\N	2025-10-25 10:53:53.787	2025-10-25 10:53:53.787
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.order_items (id, order_id, product_id, variant_id, quantity, created_at, product_data, product_name, product_sku, total_price, unit_price, updated_at) FROM stdin;
cmehmywrb0042i9kg6chpqtpm	cmehmywrb0040i9kgif6byqct	cmehmytvo000pi9kgcuq1x6z0	\N	1	2025-08-18 21:37:48.119	\N	iPhone 15 Pro	\N	999.99	999.99	2025-08-18 21:37:48.119
cmehmywrb0043i9kgucsbu5lu	cmehmywrb0040i9kgif6byqct	cmehmyuey000vi9kg3lbtyifx	\N	3	2025-08-18 21:37:48.119	\N	iPhone 15 Pro	\N	999.99	88.99	2025-08-18 21:37:48.119
cmehmyxt3004bi9kgx1yz691e	cmehmyxt20049i9kgknx1ul8y	cmehmyuew000ti9kgooiqhhuq	\N	1	2025-08-18 21:37:49.478	\N	Samsung Galaxy S24 Ultra	\N	1199.99	1199.99	2025-08-18 21:37:49.478
cmehmyxt3004ci9kgh0bkqscy	cmehmyxt20049i9kgknx1ul8y	cmehmytvp000ri9kg1015mf1i	\N	2	2025-08-18 21:37:49.478	\N	Slim Fit Chino Pants	\N	159.98	79.99	2025-08-18 21:37:49.478
cmekbryi20002i9ugbyu0w33n	cmekbry570001i9ugh6p6igd6	cmehmyuf6000xi9kgx53732id	\N	1	2025-08-20 18:47:46.536	{"id": "cmehmyuf6000xi9kgx53732id", "name": "Premium Cotton Polo Shirt", "image": "/mens-navy-polo.png", "price": "49.99", "quantity": "1"}	Premium Cotton Polo Shirt	\N	49.99	49.99	2025-08-20 18:47:46.536
cmekbryi30003i9ugitouqxgd	cmekbry570001i9ugh6p6igd6	cmehmyuew000ti9kgooiqhhuq	\N	1	2025-08-20 18:47:46.536	{"id": "cmehmyuew000ti9kgooiqhhuq", "name": "Samsung Galaxy S24 Ultra", "image": "/samsung-galaxy-s24-ultra.png", "price": "1199.99", "quantity": "1"}	Samsung Galaxy S24 Ultra	\N	1199.99	1199.99	2025-08-20 18:47:46.536
cmekbryi30004i9ugdchsofa3	cmekbry570001i9ugh6p6igd6	cmehmyuf8000zi9kgsu5rm18f	\N	1	2025-08-20 18:47:46.536	{"id": "cmehmyuf8000zi9kgsu5rm18f", "name": "Anti-Aging Serum", "image": "/anti-aging-serum.png", "price": "79.99", "quantity": "1"}	Anti-Aging Serum	\N	79.99	79.99	2025-08-20 18:47:46.536
cmekbryi30005i9ugfvr73gvv	cmekbry570001i9ugh6p6igd6	cmehmyuey000vi9kg3lbtyifx	\N	1	2025-08-20 18:47:46.536	{"id": "cmehmyuey000vi9kg3lbtyifx", "name": "Dell XPS 13 Plus", "image": "/dell-xps-13.png", "price": "1299.99", "quantity": "1"}	Dell XPS 13 Plus	\N	1299.99	1299.99	2025-08-20 18:47:46.536
cmekbvfii000ci9ugyea9f5a6	cmekbvf64000bi9ug4yxyvkm6	cmehmyuf6000xi9kgx53732id	\N	1	2025-08-20 18:50:28.555	{"id": "cmehmyuf6000xi9kgx53732id", "name": "Premium Cotton Polo Shirt", "image": "/mens-navy-polo.png", "price": "49.99", "quantity": "1"}	Premium Cotton Polo Shirt	\N	49.99	49.99	2025-08-20 18:50:28.555
cmekep26b0011i9ughj3kullx	cmekep1r80010i9ugya6m433x	cmehmyufd0015i9kg4t8rvemm	\N	1	2025-08-20 20:09:30.18	{"id": "cmehmyufd0015i9kg4t8rvemm", "name": "MacBook Pro 16-inch M3", "image": "/macbook-pro-16-inch.png", "price": "2499.99", "quantity": "1"}	MacBook Pro 16-inch M3	\N	2499.99	2499.99	2025-08-20 20:09:30.18
cmekituye0007i9kszeoc9bje	cmekituls0006i9ksckiohk4n	cmehmyuey000vi9kg3lbtyifx	\N	1	2025-08-20 22:05:12.566	{"id": "cmehmyuey000vi9kg3lbtyifx", "name": "Dell XPS 13 Plus", "image": "/dell-xps-13.png", "price": "1299.99", "quantity": "1"}	Dell XPS 13 Plus	\N	1299.99	1299.99	2025-08-20 22:05:12.566
cmel6ztpf0004i94cuonyc8ii	cmel6zt8a0003i94cl8nqwdio	cmehmyuew000ti9kgooiqhhuq	\N	1	2025-08-21 09:21:41.667	{"id": "cmehmyuew000ti9kgooiqhhuq", "name": "Samsung Galaxy S24 Ultra", "image": "/samsung-galaxy-s24-ultra.png", "price": "1199.99", "quantity": "1"}	Samsung Galaxy S24 Ultra	\N	1199.99	1199.99	2025-08-21 09:21:41.667
cmelulzlj0004i9a4ftlwdw6p	cmelulz6m0003i9a41edcac8s	cmehmyuew000ti9kgooiqhhuq	\N	1	2025-08-21 20:22:46.903	{"id": "cmehmyuew000ti9kgooiqhhuq", "name": "Samsung Galaxy S24 Ultra", "image": "/samsung-galaxy-s24-ultra.png", "price": "1199.99", "quantity": "1"}	Samsung Galaxy S24 Ultra	\N	1199.99	1199.99	2025-08-21 20:22:46.903
cmh220o5r0005j572qtkzl1f2	cmh220nro0004j572wj9nn4ai	cmehmyuew000ti9kgooiqhhuq	\N	2	2025-10-22 13:53:52.719	{"id": "cmehmyuew000ti9kgooiqhhuq", "name": "Samsung Galaxy S24 Ultra", "image": "/samsung-galaxy-s24-ultra.png", "price": "1199.99", "quantity": "2"}	Samsung Galaxy S24 Ultra	\N	2399.98	1199.99	2025-10-22 13:53:52.719
cmh220o5r0006j572af72sod2	cmh220nro0004j572wj9nn4ai	cmehmyuey000vi9kg3lbtyifx	\N	1	2025-10-22 13:53:52.719	{"id": "cmehmyuey000vi9kg3lbtyifx", "name": "Dell XPS 13 Plus", "image": "/dell-xps-13.png", "price": "1299.99", "quantity": "1"}	Dell XPS 13 Plus	\N	1299.99	1299.99	2025-10-22 13:53:52.719
cmh22stu7000hj572jt569fat	cmh22stew000gj572rhov6iju	cmehmyufc0013i9kgrecuojij	\N	1	2025-10-22 14:15:46.448	{"id": "cmehmyufc0013i9kgrecuojij", "name": "Luxury Bedding Set Queen", "image": "https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68caa79b00208323aaf9/view?project=67e9a1fb0011521efac7", "price": "299.99", "quantity": "1"}	Luxury Bedding Set Queen	\N	299.99	299.99	2025-10-22 14:15:46.448
cmh22stu7000ij572q1awhqju	cmh22stew000gj572rhov6iju	cmehmyuew000ti9kgooiqhhuq	\N	1	2025-10-22 14:15:46.448	{"id": "cmehmyuew000ti9kgooiqhhuq", "name": "Samsung Galaxy S24 Ultra", "image": "https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68caa6090009dec8af26/view?project=67e9a1fb0011521efac7", "price": "1199.99", "quantity": "1"}	Samsung Galaxy S24 Ultra	\N	1199.99	1199.99	2025-10-22 14:15:46.448
cmh3efut50002j5eiwhdgirbq	cmh3efucj0001j5ei5jepy8vy	cmehmyuey000vi9kg3lbtyifx	\N	1	2025-10-23 12:29:22.746	{"id": "cmehmyuey000vi9kg3lbtyifx", "name": "Dell XPS 13 Plus", "image": "https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68caa772002624c32386/view?project=67e9a1fb0011521efac7", "price": "1299.99", "quantity": "1"}	Dell XPS 13 Plus	\N	1299.99	1299.99	2025-10-23 12:29:22.746
cmh51b27z0002j5essjvqftaz	cmh51b21c0001j5esihcq11je	cmehmyuf8000zi9kgsu5rm18f	\N	2	2025-10-24 15:57:16.415	\N	Anti-Aging Serum	\N	159.98	79.99	2025-10-24 15:57:16.415
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.orders (id, user_id, status, total_amount, subtotal, tax, shipping, discount, payment_status, coupon_id, tracking_number, notes, created_at, updated_at, deleted_at, customer_notes, estimated_delivery, order_number, shipping_method, delivered_at, driver_id) FROM stdin;
cmehmywrb0040i9kgif6byqct	cmehmys0w0001i9kgemb7pnli	pending	229.98	209.98	20.00	0.00	0.00	paid	\N	\N	\N	2025-08-18 21:37:48.119	2025-08-18 21:37:48.119	\N	\N	\N	ORD-rrnumw92	\N	\N	\N
cmehmyxt20049i9kgknx1ul8y	cmehmys0w0001i9kgemb7pnli	shipped	249.99	249.97	0.02	0.00	0.00	paid	\N	\N	\N	2025-08-18 21:37:49.478	2025-08-18 21:37:49.478	\N	\N	\N	ORD-txzmf8lh	\N	\N	\N
cmekbvf64000bi9ug4yxyvkm6	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	processing	49.99	49.99	0.00	0.00	0.00	paid	\N	\N	\N	2025-08-20 18:50:28.109	2025-08-20 18:50:28.109	\N	\N	\N	TREND-1755715808476-3PTRCU	\N	\N	\N
cmekbry570001i9ugh6p6igd6	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	shipped	2629.96	2629.96	0.00	0.00	0.00	paid	\N	\N	\N	2025-08-20 18:47:46.075	2025-08-20 19:29:51.585	\N	\N	\N	TREND-1755713579982-XBCQNN	\N	\N	\N
cmekep1r80010i9ugya6m433x	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	shipped	2499.99	2499.99	0.00	0.00	0.00	paid	\N	\N	\N	2025-08-20 20:09:29.636	2025-08-20 20:34:19.176	\N	\N	\N	TREND-1755720544382-FCGQSP	\N	\N	\N
cmekituls0006i9ksckiohk4n	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	processing	1299.99	1299.99	0.00	0.00	0.00	paid	\N	\N	\N	2025-08-20 22:05:12.112	2025-08-20 22:05:12.112	\N	\N	\N	TREND-1755727494054-O00RL4	\N	\N	\N
cmel6zt8a0003i94cl8nqwdio	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	processing	1199.99	1199.99	0.00	0.00	0.00	paid	\N	\N	\N	2025-08-21 09:21:41.05	2025-08-21 09:21:41.05	\N	\N	\N	TREND-1755768063143-MH946A	\N	\N	\N
cmelulz6m0003i9a41edcac8s	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	processing	1199.99	1199.99	0.00	0.00	0.00	paid	\N	\N	\N	2025-08-21 20:22:46.366	2025-08-21 20:22:46.366	\N	\N	\N	TREND-1755807748183-ESITA5	\N	\N	\N
cmh220nro0004j572wj9nn4ai	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	processing	3699.97	3699.97	0.00	0.00	0.00	paid	\N	\N	\N	2025-10-22 13:53:52.212	2025-10-22 13:53:52.212	\N	\N	\N	TREND-1761141083047-KDIU25	\N	\N	\N
cmh22stew000gj572rhov6iju	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	processing	1499.98	1499.98	0.00	0.00	0.00	paid	\N	\N	\N	2025-10-22 14:15:45.896	2025-10-22 14:15:45.896	\N	\N	\N	TREND-1761142419245-EVOAJR	\N	\N	\N
cmh3efucj0001j5ei5jepy8vy	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	processing	1361.53	1299.99	0.00	35.00	0.00	paid	\N	\N	\N	2025-10-23 12:29:22.147	2025-10-23 12:29:24.33	\N	\N	\N	TREND-1761222178934-O50E34	\N	\N	\N
cmh51b21c0001j5esihcq11je	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	pending	159.98	159.98	0.00	0.00	0.00	unpaid	\N	\N	\N	2025-10-24 15:57:16.177	2025-10-24 15:57:16.177	\N	\N	\N	ORD-1761321436173-3GWW8	\N	\N	\N
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.payments (id, order_id, transaction_id, amount, currency, created_at, updated_at, failed_at, failure_reason, gateway_fee, metadata, method, paid_at, status) FROM stdin;
cmehmyxmh0047i9kgtpw9s3ym	cmehmywrb0040i9kgif6byqct	txn_f4b7sr3vl6l	229.98	usd	2025-08-18 21:37:49.241	2025-08-18 21:37:49.241	\N	\N	\N	\N	stripe	\N	paid
cmehmyybm004gi9kg9e6blcd3	cmehmyxt20049i9kgknx1ul8y	txn_kryexyslu9	249.99	usd	2025-08-18 21:37:50.146	2025-08-18 21:37:50.146	\N	\N	\N	\N	paypal	\N	paid
cmekbryon0007i9ugw575rlxk	cmekbry570001i9ugh6p6igd6	5257776739	2629.96	GHS	2025-08-20 18:47:46.775	2025-08-20 18:47:46.775	\N	\N	51.29	{"id": 5257776739, "log": {"input": [], "errors": 0, "mobile": true, "history": [{"time": 7, "type": "action", "message": "Set payment method to: mobile_money"}, {"time": 14, "type": "action", "message": "Attempted to pay with mobile money"}], "success": false, "attempts": 1, "start_time": 1755713584, "time_spent": 14}, "fees": 5129, "plan": null, "split": {}, "amount": 262996, "domain": "test", "paidAt": "2025-08-20T18:13:17.000Z", "source": null, "status": "success", "channel": "mobile_money", "connect": null, "message": null, "paid_at": "2025-08-20T18:13:17.000Z", "currency": "GHS", "customer": {"id": 300645655, "email": "testpjmail@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_2glkd8d4rbb3p3p", "international_format_phone": null}, "metadata": {"items": [{"id": "cmehmyuf6000xi9kgx53732id", "name": "Premium Cotton Polo Shirt", "image": "/mens-navy-polo.png", "price": "49.99", "quantity": "1"}, {"id": "cmehmyuew000ti9kgooiqhhuq", "name": "Samsung Galaxy S24 Ultra", "image": "/samsung-galaxy-s24-ultra.png", "price": "1199.99", "quantity": "1"}, {"id": "cmehmyuf8000zi9kgsu5rm18f", "name": "Anti-Aging Serum", "image": "/anti-aging-serum.png", "price": "79.99", "quantity": "1"}, {"id": "cmehmyuey000vi9kg3lbtyifx", "name": "Dell XPS 13 Plus", "image": "/dell-xps-13.png", "price": "1299.99", "quantity": "1"}], "userId": "user_2v2E35dLiYgfHGjB4pkWvbIe5Yo", "referrer": "http://localhost:3000/", "reference": "TREND-1755713579982-XBCQNN"}, "order_id": null, "createdAt": "2025-08-20T18:12:58.000Z", "reference": "TREND-1755713579982-XBCQNN", "created_at": "2025-08-20T18:12:58.000Z", "fees_split": null, "ip_address": "41.218.204.17", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "055XXX", "bank": "MTN", "brand": "Mtn", "last4": "X987", "channel": "mobile_money", "exp_year": "9999", "reusable": false, "card_type": "", "exp_month": "12", "signature": null, "account_name": null, "country_code": "GH", "receiver_bank": null, "authorization_code": "AUTH_5hutrpzq94", "mobile_money_number": "0551234987", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": "10101", "gateway_response": "Approved", "requested_amount": 262996, "transaction_date": "2025-08-20T18:12:58.000Z", "pos_transaction_data": null}	paystack	2025-08-20 18:13:17	paid
cmekbvfor000ei9ughxaqfciu	cmekbvf64000bi9ug4yxyvkm6	5257851468	49.99	GHS	2025-08-20 18:50:28.779	2025-08-20 18:50:28.779	\N	\N	0.98	{"id": 5257851468, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 5, "type": "action", "message": "Attempted to pay with mobile money"}], "success": false, "attempts": 1, "start_time": 1755715811, "time_spent": 5}, "fees": 98, "plan": null, "split": {}, "amount": 4999, "domain": "test", "paidAt": "2025-08-20T18:50:14.000Z", "source": null, "status": "success", "channel": "mobile_money", "connect": null, "message": null, "paid_at": "2025-08-20T18:50:14.000Z", "currency": "GHS", "customer": {"id": 300645655, "email": "testpjmail@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_2glkd8d4rbb3p3p", "international_format_phone": null}, "metadata": {"items": [{"id": "cmehmyuf6000xi9kgx53732id", "name": "Premium Cotton Polo Shirt", "image": "/mens-navy-polo.png", "price": "49.99", "quantity": "1"}], "userId": "user_2v2E35dLiYgfHGjB4pkWvbIe5Yo", "referrer": "http://localhost:3000/", "reference": "TREND-1755715808476-3PTRCU"}, "order_id": null, "createdAt": "2025-08-20T18:50:07.000Z", "reference": "TREND-1755715808476-3PTRCU", "created_at": "2025-08-20T18:50:07.000Z", "fees_split": null, "ip_address": "41.218.204.17", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "055XXX", "bank": "MTN", "brand": "Mtn", "last4": "X987", "channel": "mobile_money", "exp_year": "9999", "reusable": false, "card_type": "", "exp_month": "12", "signature": null, "account_name": null, "country_code": "GH", "receiver_bank": null, "authorization_code": "AUTH_w0036qa137", "mobile_money_number": "0551234987", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": "10101", "gateway_response": "Approved", "requested_amount": 4999, "transaction_date": "2025-08-20T18:50:07.000Z", "pos_transaction_data": null}	paystack	2025-08-20 18:50:14	paid
cmekep2co0013i9ugltpr8okp	cmekep1r80010i9ugya6m433x	5258005598	2499.99	GHS	2025-08-20 20:09:30.408	2025-08-20 20:09:30.408	\N	\N	48.75	{"id": 5258005598, "log": {"input": [], "errors": 0, "mobile": true, "history": [{"time": 2, "type": "action", "message": "Set payment method to: mobile_money"}, {"time": 4, "type": "action", "message": "Attempted to pay with mobile money"}], "success": false, "attempts": 1, "start_time": 1755720548, "time_spent": 4}, "fees": 4875, "plan": null, "split": {}, "amount": 249999, "domain": "test", "paidAt": "2025-08-20T20:09:10.000Z", "source": null, "status": "success", "channel": "mobile_money", "connect": null, "message": null, "paid_at": "2025-08-20T20:09:10.000Z", "currency": "GHS", "customer": {"id": 300645655, "email": "testpjmail@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_2glkd8d4rbb3p3p", "international_format_phone": null}, "delivery": {"fee": "0", "method": "pickup", "pickupCity": "Accra", "pickupLocation": "Osu Shop"}, "metadata": {"items": [{"id": "cmehmyufd0015i9kg4t8rvemm", "name": "MacBook Pro 16-inch M3", "image": "/macbook-pro-16-inch.png", "price": "2499.99", "quantity": "1"}], "userId": "user_2v2E35dLiYgfHGjB4pkWvbIe5Yo", "delivery": {"fee": "0", "method": "pickup", "pickupCity": "Accra", "pickupLocation": "Osu Shop"}, "referrer": "http://localhost:3000/", "reference": "TREND-1755720544382-FCGQSP"}, "order_id": null, "createdAt": "2025-08-20T20:09:03.000Z", "reference": "TREND-1755720544382-FCGQSP", "created_at": "2025-08-20T20:09:03.000Z", "fees_split": null, "ip_address": "41.218.204.17", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "055XXX", "bank": "MTN", "brand": "Mtn", "last4": "X987", "channel": "mobile_money", "exp_year": "9999", "reusable": false, "card_type": "", "exp_month": "12", "signature": null, "account_name": null, "country_code": "GH", "receiver_bank": null, "authorization_code": "AUTH_05ithfweam", "mobile_money_number": "0551234987", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": "10101", "gateway_response": "Approved", "requested_amount": 249999, "transaction_date": "2025-08-20T20:09:03.000Z", "pos_transaction_data": null}	paystack	2025-08-20 20:09:10	paid
cmekitv4y0009i9kshggddvav	cmekituls0006i9ksckiohk4n	5258218834	1299.99	GHS	2025-08-20 22:05:12.802	2025-08-20 22:05:12.802	\N	\N	25.35	{"id": 5258218834, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 2, "type": "action", "message": "Attempted to pay with mobile money"}], "success": false, "attempts": 1, "start_time": 1755727497, "time_spent": 2}, "fees": 2535, "plan": null, "split": {}, "amount": 129999, "domain": "test", "paidAt": "2025-08-20T22:04:57.000Z", "source": null, "status": "success", "channel": "mobile_money", "connect": null, "message": null, "paid_at": "2025-08-20T22:04:57.000Z", "currency": "GHS", "customer": {"id": 300645655, "email": "testpjmail@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_2glkd8d4rbb3p3p", "international_format_phone": null}, "delivery": {"fee": "0", "method": "pickup", "pickupCity": "Accra", "pickupLocation": "Osu"}, "metadata": {"items": [{"id": "cmehmyuey000vi9kg3lbtyifx", "name": "Dell XPS 13 Plus", "image": "/dell-xps-13.png", "price": "1299.99", "quantity": "1"}], "userId": "user_2v2E35dLiYgfHGjB4pkWvbIe5Yo", "delivery": {"fee": "0", "method": "pickup", "pickupCity": "Accra", "pickupLocation": "Osu"}, "referrer": "http://localhost:3000/", "reference": "TREND-1755727494054-O00RL4"}, "order_id": null, "createdAt": "2025-08-20T22:04:52.000Z", "reference": "TREND-1755727494054-O00RL4", "created_at": "2025-08-20T22:04:52.000Z", "fees_split": null, "ip_address": "41.218.204.17", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "055XXX", "bank": "MTN", "brand": "Mtn", "last4": "X987", "channel": "mobile_money", "exp_year": "9999", "reusable": false, "card_type": "", "exp_month": "12", "signature": null, "account_name": null, "country_code": "GH", "receiver_bank": null, "authorization_code": "AUTH_rm1joev7zw", "mobile_money_number": "0551234987", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": "10101", "gateway_response": "Approved", "requested_amount": 129999, "transaction_date": "2025-08-20T22:04:52.000Z", "pos_transaction_data": null}	paystack	2025-08-20 22:04:57	paid
cmel6ztxh0006i94can2huoj3	cmel6zt8a0003i94cl8nqwdio	5259442032	1199.99	GHS	2025-08-21 09:21:41.957	2025-08-21 09:21:41.957	\N	\N	23.79	{"id": 5259442032, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 7, "type": "action", "message": "Attempted to pay with mobile money"}], "success": false, "attempts": 1, "start_time": 1755768066, "time_spent": 7}, "fees": 2379, "plan": null, "split": {}, "amount": 121999, "domain": "test", "paidAt": "2025-08-21T09:21:13.000Z", "source": null, "status": "success", "channel": "mobile_money", "connect": null, "message": null, "paid_at": "2025-08-21T09:21:13.000Z", "currency": "GHS", "customer": {"id": 300645655, "email": "testpjmail@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_2glkd8d4rbb3p3p", "international_format_phone": null}, "delivery": {"fee": "25", "method": "door", "pickupCity": "Accra", "pickupLocation": "Osu"}, "metadata": {"items": [{"id": "cmehmyuew000ti9kgooiqhhuq", "name": "Samsung Galaxy S24 Ultra", "image": "/samsung-galaxy-s24-ultra.png", "price": "1199.99", "quantity": "1"}], "userId": "user_2v2E35dLiYgfHGjB4pkWvbIe5Yo", "delivery": {"fee": "25", "method": "door", "pickupCity": "Accra", "pickupLocation": "Osu"}, "referrer": "http://localhost:3000/", "addressId": "cmehmysr90009i9kgv6iybx1d", "reference": "TREND-1755768063143-MH946A", "addressSnapshot": {"city": "San Francisco", "phone": "555-123-4567", "state": "CA", "street": "123 Tech Street", "country": "United States", "zipCode": "94105", "fullName": "Admin Developer"}}, "order_id": null, "createdAt": "2025-08-21T09:21:03.000Z", "reference": "TREND-1755768063143-MH946A", "created_at": "2025-08-21T09:21:03.000Z", "fees_split": null, "ip_address": "154.160.3.83", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "055XXX", "bank": "MTN", "brand": "Mtn", "last4": "X987", "channel": "mobile_money", "exp_year": "9999", "reusable": false, "card_type": "", "exp_month": "12", "signature": null, "account_name": null, "country_code": "GH", "receiver_bank": null, "authorization_code": "AUTH_6xqsdh9l5v", "mobile_money_number": "0551234987", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": "10101", "gateway_response": "Approved", "requested_amount": 121999, "transaction_date": "2025-08-21T09:21:03.000Z", "pos_transaction_data": null}	paystack	2025-08-21 09:21:13	paid
cmelulzt90006i9a4ep1pq9h5	cmelulz6m0003i9a41edcac8s	5261107425	1199.99	GHS	2025-08-21 20:22:47.181	2025-08-21 20:22:47.181	\N	\N	24.09	{"id": 5261107425, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 3, "type": "action", "message": "Attempted to pay with mobile money"}], "success": false, "attempts": 1, "start_time": 1755807752, "time_spent": 3}, "fees": 2409, "plan": null, "split": {}, "amount": 123499, "domain": "test", "paidAt": "2025-08-21T20:22:35.000Z", "source": null, "status": "success", "channel": "mobile_money", "connect": null, "message": null, "paid_at": "2025-08-21T20:22:35.000Z", "currency": "GHS", "customer": {"id": 300645655, "email": "testpjmail@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_2glkd8d4rbb3p3p", "international_format_phone": null}, "delivery": {"fee": "25", "method": "door", "pickupCity": "", "pickupLocation": ""}, "metadata": {"items": [{"id": "cmehmyuew000ti9kgooiqhhuq", "name": "Samsung Galaxy S24 Ultra", "image": "/samsung-galaxy-s24-ultra.png", "price": "1199.99", "quantity": "1"}], "userId": "user_2v2E35dLiYgfHGjB4pkWvbIe5Yo", "delivery": {"fee": "25", "method": "door", "pickupCity": "", "pickupLocation": ""}, "referrer": "http://localhost:3000/", "addressId": "cmehmysr90009i9kgv6iybx1d", "reference": "TREND-1755807748183-ESITA5", "addressSnapshot": {"city": "San Francisco", "phone": "555-123-4567", "state": "CA", "street": "123 Tech Street", "country": "United States", "zipCode": "94105", "fullName": "Admin Developer"}}, "order_id": null, "createdAt": "2025-08-21T20:22:29.000Z", "reference": "TREND-1755807748183-ESITA5", "created_at": "2025-08-21T20:22:29.000Z", "fees_split": null, "ip_address": "41.218.204.17", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "055XXX", "bank": "MTN", "brand": "Mtn", "last4": "X987", "channel": "mobile_money", "exp_year": "9999", "reusable": false, "card_type": "", "exp_month": "12", "signature": null, "account_name": null, "country_code": "GH", "receiver_bank": null, "authorization_code": "AUTH_3oqc5dkoqz", "mobile_money_number": "0551234987", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": "10101", "gateway_response": "Approved", "requested_amount": 123499, "transaction_date": "2025-08-21T20:22:29.000Z", "pos_transaction_data": null}	paystack	2025-08-21 20:22:35	paid
cmh220oet0008j572u2at7x3i	cmh220nro0004j572wj9nn4ai	5455032599	3699.97	GHS	2025-10-22 13:53:53.045	2025-10-22 13:53:53.045	\N	\N	72.84	{"id": 5455032599, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 129, "type": "action", "message": "Attempted to pay with mobile money"}], "success": false, "attempts": 1, "start_time": 1761141086, "time_spent": 129}, "fees": 7284, "plan": null, "split": {}, "amount": 373497, "domain": "test", "paidAt": "2025-10-22T13:53:35.000Z", "source": null, "status": "success", "channel": "mobile_money", "connect": null, "message": null, "paid_at": "2025-10-22T13:53:35.000Z", "currency": "GHS", "customer": {"id": 300645655, "email": "testpjmail@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_2glkd8d4rbb3p3p", "international_format_phone": null}, "delivery": {"fee": "35", "method": "door", "pickupCity": "", "pickupLocation": ""}, "metadata": {"items": [{"id": "cmehmyuew000ti9kgooiqhhuq", "name": "Samsung Galaxy S24 Ultra", "image": "/samsung-galaxy-s24-ultra.png", "price": "1199.99", "quantity": "2"}, {"id": "cmehmyuey000vi9kg3lbtyifx", "name": "Dell XPS 13 Plus", "image": "/dell-xps-13.png", "price": "1299.99", "quantity": "1"}], "userId": "user_2v2E35dLiYgfHGjB4pkWvbIe5Yo", "delivery": {"fee": "35", "method": "door", "pickupCity": "", "pickupLocation": ""}, "referrer": "http://localhost:3000/", "addressId": "cmehmysr90009i9kgv6iybx1d", "reference": "TREND-1761141083047-KDIU25", "addressSnapshot": {"city": "San Francisco", "phone": "555-123-4567", "state": "CA", "street": "123 Tech Street", "country": "United States", "zipCode": "94105", "fullName": "Admin Developer"}}, "order_id": null, "createdAt": "2025-10-22T13:51:23.000Z", "reference": "TREND-1761141083047-KDIU25", "created_at": "2025-10-22T13:51:23.000Z", "fees_split": null, "ip_address": "41.218.192.48", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "055XXX", "bank": "MTN", "brand": "Mtn", "last4": "X987", "channel": "mobile_money", "exp_year": "9999", "reusable": false, "card_type": "", "exp_month": "12", "signature": null, "account_name": null, "country_code": "GH", "receiver_bank": null, "authorization_code": "AUTH_236v535dn1", "mobile_money_number": "0551234987", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": "10101", "gateway_response": "Approved", "requested_amount": 373497, "transaction_date": "2025-10-22T13:51:23.000Z", "pos_transaction_data": null}	paystack	2025-10-22 13:53:35	paid
cmh22su2p000kj572qipwej81	cmh22stew000gj572rhov6iju	5455080000	1499.98	GHS	2025-10-22 14:15:46.753	2025-10-22 14:15:46.753	\N	\N	29.94	{"id": 5455080000, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 61, "type": "action", "message": "Attempted to pay with mobile money"}], "success": false, "attempts": 1, "start_time": 1761142423, "time_spent": 61}, "fees": 2994, "plan": null, "split": {}, "amount": 153498, "domain": "test", "paidAt": "2025-10-22T14:14:44.000Z", "source": null, "status": "success", "channel": "mobile_money", "connect": null, "message": null, "paid_at": "2025-10-22T14:14:44.000Z", "currency": "GHS", "customer": {"id": 300645655, "email": "testpjmail@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_2glkd8d4rbb3p3p", "international_format_phone": null}, "delivery": {"fee": "35", "method": "door", "pickupCity": "", "pickupLocation": ""}, "metadata": {"items": [{"id": "cmehmyufc0013i9kgrecuojij", "name": "Luxury Bedding Set Queen", "image": "https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68caa79b00208323aaf9/view?project=67e9a1fb0011521efac7", "price": "299.99", "quantity": "1"}, {"id": "cmehmyuew000ti9kgooiqhhuq", "name": "Samsung Galaxy S24 Ultra", "image": "https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68caa6090009dec8af26/view?project=67e9a1fb0011521efac7", "price": "1199.99", "quantity": "1"}], "userId": "user_2v2E35dLiYgfHGjB4pkWvbIe5Yo", "delivery": {"fee": "35", "method": "door", "pickupCity": "", "pickupLocation": ""}, "referrer": "http://localhost:3000/", "addressId": "cmehmysr90009i9kgv6iybx1d", "reference": "TREND-1761142419245-EVOAJR", "addressSnapshot": {"city": "San Francisco", "phone": "555-123-4567", "state": "CA", "street": "123 Tech Street", "country": "United States", "zipCode": "94105", "fullName": "Admin Developer"}}, "order_id": null, "createdAt": "2025-10-22T14:13:39.000Z", "reference": "TREND-1761142419245-EVOAJR", "created_at": "2025-10-22T14:13:39.000Z", "fees_split": null, "ip_address": "41.218.192.48", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "055XXX", "bank": "MTN", "brand": "Mtn", "last4": "X987", "channel": "mobile_money", "exp_year": "9999", "reusable": false, "card_type": "", "exp_month": "12", "signature": null, "account_name": null, "country_code": "GH", "receiver_bank": null, "authorization_code": "AUTH_wzr5zcbfyu", "mobile_money_number": "0551234987", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": "10101", "gateway_response": "Approved", "requested_amount": 153498, "transaction_date": "2025-10-22T14:13:39.000Z", "pos_transaction_data": null}	paystack	2025-10-22 14:14:44	paid
cmh3efvi60004j5eiwoudhtac	cmh3efucj0001j5ei5jepy8vy	5458067636	1326.53	GHS	2025-10-23 12:29:23.646	2025-10-23 12:29:23.646	\N	\N	26.54	{"id": 5458067636, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 3, "type": "action", "message": "Attempted to pay with mobile money"}], "success": false, "attempts": 1, "start_time": 1761222181, "time_spent": 3}, "fees": 2654, "plan": null, "split": {}, "amount": 136070, "domain": "test", "paidAt": "2025-10-23T12:23:04.000Z", "source": null, "status": "success", "channel": "mobile_money", "connect": null, "message": null, "paid_at": "2025-10-23T12:23:04.000Z", "currency": "GHS", "customer": {"id": 300645655, "email": "testpjmail@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_2glkd8d4rbb3p3p", "international_format_phone": null}, "delivery": {"fee": "35", "method": "door", "pickupCity": "Accra", "pickupLocation": ""}, "metadata": {"fees": {"gateway": "20.710507614213157", "baseAmount": "1339.99", "gatewayBreakdown": {"fixed": "0.3", "percentage": "0.015"}}, "items": [{"id": "cmehmyuey000vi9kg3lbtyifx", "name": "Dell XPS 13 Plus", "image": "https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68caa772002624c32386/view?project=67e9a1fb0011521efac7", "price": "1299.99", "quantity": "1"}], "userId": "user_2v2E35dLiYgfHGjB4pkWvbIe5Yo", "delivery": {"fee": "35", "method": "door", "pickupCity": "Accra", "pickupLocation": ""}, "referrer": "http://localhost:3000/", "addressId": "cmehmysr90009i9kgv6iybx1d", "reference": "TREND-1761222178934-O50E34", "addressSnapshot": {"city": "San Francisco", "phone": "555-123-4567", "state": "CA", "street": "123 Tech Street", "country": "United States", "zipCode": "94105", "fullName": "Admin Developer"}}, "order_id": null, "createdAt": "2025-10-23T12:22:59.000Z", "reference": "TREND-1761222178934-O50E34", "created_at": "2025-10-23T12:22:59.000Z", "fees_split": null, "ip_address": "154.160.3.15", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "055XXX", "bank": "MTN", "brand": "Mtn", "last4": "X987", "channel": "mobile_money", "exp_year": "9999", "reusable": false, "card_type": "", "exp_month": "12", "signature": null, "account_name": null, "country_code": "GH", "receiver_bank": null, "authorization_code": "AUTH_nltoa0bcvh", "mobile_money_number": "0551234987", "receiver_bank_account_number": null}, "fees_breakdown": null, "receipt_number": "10101", "gateway_response": "Approved", "requested_amount": 136070, "transaction_date": "2025-10-23T12:22:59.000Z", "pos_transaction_data": null}	paystack	2025-10-23 12:23:04	paid
cmh51b2kx0006j5es52gvxb6m	cmh51b21c0001j5esihcq11je	\N	159.98	NGN	2025-10-24 15:57:16.881	2025-10-24 15:57:22.934	\N	\N	\N	\N	paystack	\N	unpaid
\.


--
-- Data for Name: pickup_locations; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.pickup_locations (id, city_id, name, address, is_active, created_at, updated_at) FROM stdin;
cmh208qni0002j572fg6pb30m	cmekgw95w0002i9ksld3h58q4	Oyarifa		t	2025-10-22 13:04:09.966	2025-10-23 12:14:35.194
cmekio9b20004i9ksrcfryrvt	cmekgw95w0002i9ksld3h58q4	Osu		t	2025-08-20 22:00:51.231	2025-10-23 12:15:11.756
\.


--
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.product_tags (id, product_id, tag_id, created_at) FROM stdin;
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.product_variants (id, product_id, name, sku, price, stock, attributes, created_at, updated_at, deleted_at, barcode, cost_price, is_active, weight) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.products (id, name, slug, description, price, compare_price, sku, stock, category_id, images, is_deleted, created_at, updated_at, deleted_at, is_active, is_featured, barcode, cost_price, dimensions, low_stock_alert, seo_description, seo_title, short_description, weight, status) FROM stdin;
cmehmytvo000pi9kgcuq1x6z0	iPhone 15 Pro	iphone-15-pro	The most advanced iPhone with titanium design, A17 Pro chip, and professional camera system.	999.99	\N	\N	25	cmehmyt46000ci9kgpm2toj3n	{/iphone-15-pro-front.png,/iphone-15-pro-back.png,/iphone-15-pro-side.png}	f	2025-08-18 21:37:44.387	2025-08-18 21:37:44.387	\N	t	t	\N	\N	\N	5	\N	\N	\N	\N	active
cmehmytvp000ri9kg1015mf1i	Slim Fit Chino Pants	slim-fit-chino-pants	Versatile chino pants with modern slim fit. Perfect for casual and business casual occasions.	79.99	\N	\N	85	cmehmytgz000hi9kgru79puuo	{/placeholder-9za5d.png}	f	2025-08-18 21:37:44.387	2025-08-18 21:37:44.387	\N	t	t	\N	\N	\N	5	\N	\N	\N	\N	active
cmehmytvo000qi9kg5ygnzimm	Floral Summer Dress	floral-summer-dress	Elegant floral dress perfect for summer occasions. Lightweight and comfortable fabric.	89.99	\N	\N	60	cmehmytk5000ji9kgl25bl4zw	{/womens-floral-dress.png,/floral-dress-detail.png}	f	2025-08-18 21:37:44.387	2025-08-18 21:37:44.387	\N	t	t	\N	\N	\N	5	\N	\N	\N	\N	active
cmehmyuf6000xi9kgx53732id	Premium Cotton Polo Shirt	premium-cotton-polo-shirt	Classic fit polo shirt made from 100% premium cotton. Available in multiple colors.	49.99	\N	\N	150	cmehmytgz000hi9kgru79puuo	{/mens-navy-polo.png,/white-mens-polo.png}	f	2025-08-18 21:37:44.387	2025-08-18 21:37:44.387	\N	t	f	\N	\N	\N	5	\N	\N	\N	\N	active
cmehmyufa0011i9kgswg6y9bi	Smart Coffee Maker Pro	smart-coffee-maker-pro	WiFi-enabled coffee maker with app control, programmable brewing, and thermal carafe.	199.99	\N	\N	35	cmehmytnd000ki9kgx04p979z	{/placeholder-dyyfy.png}	f	2025-08-18 21:37:44.387	2025-08-18 21:37:44.387	\N	t	f	\N	\N	\N	5	\N	\N	\N	\N	active
cmehmyuew000ti9kgooiqhhuq	Samsung Galaxy S24 Ultra	samsung-galaxy-s24-ultra	Premium Android smartphone with S Pen, advanced AI features, and exceptional camera quality.	1199.99	\N	\N	18	cmehmyt46000ci9kgpm2toj3n	{https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68caa6090009dec8af26/view?project=67e9a1fb0011521efac7,https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68caa6e5001bba6a89f0/view?project=67e9a1fb0011521efac7}	f	2025-08-18 21:37:44.388	2025-09-17 12:18:08.424	\N	t	t	\N	\N	\N	5	\N	\N	\N	\N	active
cmehmyuey000vi9kg3lbtyifx	Dell XPS 13 Plus	dell-xps-13-plus	Ultra-thin laptop with InfinityEdge display, premium materials, and exceptional performance.	1299.99	\N	\N	20	cmehmytah000ei9kgxmpe8nzi	{https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68caa772002624c32386/view?project=67e9a1fb0011521efac7}	f	2025-08-18 21:37:44.388	2025-09-17 12:20:05.307	\N	t	f	\N	\N	\N	5	\N	\N	\N	\N	active
cmehmyufc0013i9kgrecuojij	Luxury Bedding Set Queen	luxury-bedding-set-queen	Premium 1000 thread count Egyptian cotton bedding set. Includes sheets, pillowcases, and duvet cover.	299.99	\N	\N	25	cmehmytnd000ki9kgx04p979z	{https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68caa79b00208323aaf9/view?project=67e9a1fb0011521efac7}	f	2025-08-18 21:37:44.388	2025-09-17 12:20:48.755	\N	t	f	\N	\N	\N	5	\N	\N	\N	\N	active
cmehmyufd0015i9kg4t8rvemm	MacBook Pro 16-inch M3	macbook-pro-16-m3	Powerful laptop with M3 chip, stunning Liquid Retina XDR display, and all-day battery life.	2499.99	\N	\N	12	cmehmytah000ei9kgxmpe8nzi	{https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/68b077cc0000a6d1306e/view?project=67e9a1fb0011521efac7}	f	2025-08-18 21:37:44.389	2025-10-22 11:01:27.699	\N	t	f	\N	\N	\N	5	\N	\N	\N	\N	active
cmehmyuf8000zi9kgsu5rm18f	Anti-Aging Serum	anti-aging-serum	Advanced anti-aging serum with retinol and hyaluronic acid. Reduces fine lines and improves skin texture.	79.99	\N	\N	78	cmehmytqi000li9kg6g7o79ze	{https://fra.cloud.appwrite.io/v1/storage/buckets/67e9a2870011f68dbdd6/files/686a97840009e6290f0e/view?project=67e9a1fb0011521efac7}	f	2025-08-18 21:37:44.389	2025-10-24 15:57:17.126	\N	t	f	\N	\N	\N	5	\N	\N	\N	\N	active
\.


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.refunds (id, order_id, amount, reason, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: returns; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.returns (id, order_id, order_item_ids, reason, reason_details, status, refund_amount, restock_fee, shipping_cost, return_label, received_date, refunded_date, images, admin_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.reviews (id, user_id, product_id, rating, title, comment, created_at, updated_at, deleted_at, helpful_count, images, is_approved, is_verified, order_id) FROM stdin;
cmehmyuyp001di9kg7ei2c0vw	cmehmys0w0001i9kgemb7pnli	cmehmytvo000pi9kgcuq1x6z0	5	\N	Absolutely love this phone! The camera quality is incredible and the titanium build feels premium.	2025-08-18 21:37:45.793	2025-08-18 21:37:45.793	\N	0	\N	f	f	\N
cmehmyuyp001ei9kg8ocswgcl	cmehmyskt0003i9kguik3xua5	cmehmytvo000pi9kgcuq1x6z0	4	\N	Great phone overall, but the price is quite steep. Battery life is excellent though.	2025-08-18 21:37:45.793	2025-08-18 21:37:45.793	\N	0	\N	f	f	\N
cmehmyuyp001fi9kg8abze0tk	cmehmyskj0002i9kgkl0mquew	cmehmyufd0015i9kg4t8rvemm	5	\N	This laptop is a powerhouse! Perfect for video editing and development work.	2025-08-18 21:37:45.793	2025-08-18 21:37:45.793	\N	0	\N	f	f	\N
cmehmyuyp001gi9kg6amuifkt	cmehmys0w0001i9kgemb7pnli	cmehmytvp000ri9kg1015mf1i	4	\N	Good quality pants, fit is perfect. Will definitely buy more colors.	2025-08-18 21:37:45.793	2025-08-18 21:37:45.793	\N	0	\N	f	f	\N
cmelvabaj000ai9a4n61x1a14	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	cmehmyufd0015i9kg4t8rvemm	3	Good	6ryjgmnb	2025-08-21 20:41:41.803	2025-08-21 20:43:09.221	\N	0	{}	f	t	\N
cmelyqqag000ei9a4z1wn39eu	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	cmehmytvp000ri9kg1015mf1i	4	\N	\N	2025-08-21 22:18:26.585	2025-08-21 22:18:26.585	\N	0	{}	f	f	\N
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.settings (value, created_at, updated_at, description, key) FROM stdin;
{"taxRate": 10, "storeName": "Trendify", "storeEmail": "contact@example.com", "storePhone": "+1 (555) 123-4567", "orderPrefix": "", "shippingFee": 10, "currencyCode": "GHS", "storeAddress": "", "allowBackorders": false, "lowStockThreshold": 5, "enableFreeShipping": false, "enableTaxCalculation": true, "freeShippingThreshold": 100, "showOutOfStockProducts": true}	2025-10-22 13:40:21.888	2025-10-24 16:05:46.611	\N	general
"USD"	2025-08-18 21:37:45.555	2025-08-18 21:37:45.555	Default currency	currency
"Your one-stop shop for the latest trends in electronics, fashion, and home essentials"	2025-08-18 21:37:45.555	2025-08-18 21:37:45.555	Site description for SEO	site_description
"0.08"	2025-08-18 21:37:45.555	2025-08-18 21:37:45.555	Default tax rate	tax_rate
"TrendifyStore"	2025-08-18 21:37:45.555	2025-08-18 21:37:45.555	The name of the store	site_name
"50.00"	2025-08-18 21:37:45.556	2025-08-18 21:37:45.556	Minimum order amount for free shipping	free_shipping_threshold
\.


--
-- Data for Name: shipping_addresses; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.shipping_addresses (id, order_id, full_name, street, city, state, zip_code, country, phone) FROM stdin;
cmehmyxg60045i9kgruq0mnt9	cmehmywrb0040i9kgif6byqct	Francis Johnson	456 Oak Avenue	Austin	TX	78701	United States	555-987-6543
cmehmyy8h004ei9kgu0vfcj3m	cmehmyxt20049i9kgknx1ul8y	Francis Johnson	456 Oak Avenue	Austin	TX	78701	United States	555-987-6543
cmel6zuj10008i94cmrscjald	cmel6zt8a0003i94cl8nqwdio	Admin Developer	123 Tech Street	San Francisco	CA	94105	United States	555-123-4567
cmelum06s0008i9a475q9aodq	cmelulz6m0003i9a41edcac8s	Admin Developer	123 Tech Street	San Francisco	CA	94105	United States	555-123-4567
cmh220p63000aj572qj9363p3	cmh220nro0004j572wj9nn4ai	Admin Developer	123 Tech Street	San Francisco	CA	94105	United States	555-123-4567
cmh22suna000mj572hiwlb2hj	cmh22stew000gj572rhov6iju	Admin Developer	123 Tech Street	San Francisco	CA	94105	United States	555-123-4567
cmh3efwcl0006j5eihqgzlhy2	cmh3efucj0001j5ei5jepy8vy	Admin Developer	123 Tech Street	San Francisco	CA	94105	United States	555-123-4567
cmh51b2ei0004j5es146ywqte	cmh51b21c0001j5esihcq11je	Admin Developer	123 Tech Street	San Francisco	CA	94105	United States	555-123-4567
\.


--
-- Data for Name: stock_alerts; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.stock_alerts (id, email, product_id, variant_id, notified, created_at, notified_at) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.tags (id, name, created_at, updated_at, color, is_active, slug) FROM stdin;
\.


--
-- Data for Name: translation_cache; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.translation_cache (id, locale, key, value, created_at, updated_at) FROM stdin;
cmh3rq7sd0001j5yknv02fuka	fr	product.itemKeptLocally	Élément conservé localement.	2025-10-23 18:41:21.133	2025-10-23 18:41:21.133
cmh3s28az0000j56zcopxl08t	fr	common.home	Accueil	2025-10-23 18:50:41.675	2025-10-23 18:50:41.675
cmh3s2bpa0001j56zlhbxbgfc	fr	common.cart	Panier	2025-10-23 18:50:46.078	2025-10-23 18:50:46.078
cmh3s2du40002j56za4fwgzev	fr	common.wishlist	Liste de souhaits	2025-10-23 18:50:48.844	2025-10-23 18:50:48.844
cmh3s2f3m0003j56zucmy2wcz	fr	common.search	Rechercher	2025-10-23 18:50:50.482	2025-10-23 18:50:50.482
cmh3s2haz0004j56zyjzh3f3b	fr	common.signIn	Se connecter	2025-10-23 18:50:53.173	2025-10-23 18:50:53.173
cmh3s2iqb0005j56z5pn0ybbz	fr	common.signOut	Déconnexion	2025-10-23 18:50:55.188	2025-10-23 18:50:55.188
cmh3s2ju70006j56zi60mdenp	fr	common.profile	Profil	2025-10-23 18:50:56.623	2025-10-23 18:50:56.623
cmh3s2kpb0007j56zbmfgzlv8	fr	common.admin	Tableau de bord d'administration	2025-10-23 18:50:57.744	2025-10-23 18:50:57.744
cmh3s2lxs0008j56zmkcuw7w2	fr	products.loading	Chargement...	2025-10-23 18:50:59.345	2025-10-23 18:50:59.345
cmh3s2mof0009j56znddawm52	fr	products.showingLabel	Affichage	2025-10-23 18:51:00.304	2025-10-23 18:51:00.304
cmh3s2ner000aj56zu3ckz7c8	fr	products.of	de	2025-10-23 18:51:01.251	2025-10-23 18:51:01.251
cmh3srjos0000j5ggoreu1sry	fr	products.featured	À la une	2025-10-23 19:10:22.828	2025-10-23 19:10:22.828
cmh3srkkx0001j5ggcblx42fu	fr	products.priceLow	Prix : Bas à Élevé	2025-10-23 19:10:23.986	2025-10-23 19:10:23.986
cmh3srlfa0002j5gg0e3905vc	fr	products.priceHigh	Prix : Élevé à faible	2025-10-23 19:10:25.078	2025-10-23 19:10:25.078
cmh3srmmy0003j5ggx8qls3ad	fr	products.nameAsc	Nom : A → Z	2025-10-23 19:10:26.65	2025-10-23 19:10:26.65
cmh3srndv0004j5ggp8mtdjlg	fr	products.nameDesc	Nom : Z → A	2025-10-23 19:10:27.619	2025-10-23 19:10:27.619
cmh3srob50005j5ggsvoc5l65	fr	products.loadMore	Charger plus de produits	2025-10-23 19:10:28.818	2025-10-23 19:10:28.818
cmh3srpgi0006j5ggm76cr0o8	fr	nav.newArrivals	Nouveaux arrivages	2025-10-23 19:10:30.306	2025-10-23 19:10:30.306
cmh3srr2h0007j5gg4tlx2rk6	fr	nav.men	Hommes	2025-10-23 19:10:32.394	2025-10-23 19:10:32.394
cmh3sruk40008j5ggeqz3eo76	fr	nav.women	Femmes	2025-10-23 19:10:36.916	2025-10-23 19:10:36.916
cmh3ss8cz0009j5ggs4hr6k3b	fr	nav.accessories	Accessoires	2025-10-23 19:10:54.688	2025-10-23 19:10:54.688
cmh3ss9q7000aj5ggnz35x2jp	fr	nav.sale	Solde	2025-10-23 19:10:56.575	2025-10-23 19:10:56.575
cmh3ssuu3000bj5ggte4zy9m5	fr	product.outOfStock	Rupture de stock	2025-10-23 19:11:23.931	2025-10-23 19:11:23.931
cmh3sswrf000cj5ggq9lyedjy	fr	product.inStock	En stock	2025-10-23 19:11:26.427	2025-10-23 19:11:26.427
cmh3ssyuy000dj5ggvnhpnv36	fr	product.available	disponible	2025-10-23 19:11:29.146	2025-10-23 19:11:29.146
cmh3st05f000ej5ggox5i1ikk	fr	product.price	Prix	2025-10-23 19:11:30.82	2025-10-23 19:11:30.82
cmh3st2do000fj5gg8iom99g2	fr	product.description	Description	2025-10-23 19:11:33.708	2025-10-23 19:11:33.708
cmh3st3ox000gj5gg8at73d94	fr	product.reviews	Avis	2025-10-23 19:11:35.298	2025-10-23 19:11:35.298
cmh3st5wa000hj5ggckdth6d8	fr	product.noRating	Aucune évaluation	2025-10-23 19:11:38.267	2025-10-23 19:11:38.267
cmh3st6w1000ij5ggcxj5nwvv	fr	product.newBadge	NOUVEAU	2025-10-23 19:11:39.553	2025-10-23 19:11:39.553
cmh3st8ix000jj5gg0ftmx4k2	fr	product.addedToCart	Ajouté au panier	2025-10-23 19:11:41.521	2025-10-23 19:11:41.521
cmh3stafk000kj5ggmke1di0n	fr	product.signInToSyncCart	Se connecter pour synchroniser votre panier	2025-10-23 19:11:44.144	2025-10-23 19:11:44.144
cmh3stcly000lj5gg7wgs74yj	fr	product.failedToSyncCart	Échec de la synchronisation du panier	2025-10-23 19:11:46.966	2025-10-23 19:11:46.966
cmh3su5l8000mj5ggoxnl3pum	fr	checkout.pickup	Enlèvement	2025-10-23 19:12:24.524	2025-10-23 19:12:24.524
cmh3su8b0000nj5ggb1yo64pn	fr	checkout.door	Livraison à domicile	2025-10-23 19:12:28.045	2025-10-23 19:12:28.045
cmh3su9gl000oj5gg6lhcr67r	fr	checkout.shippingFee	Frais de livraison	2025-10-23 19:12:29.542	2025-10-23 19:12:29.542
cmh3suc4e000pj5ggr72s87c5	fr	checkout.gatewayFee	Frais de passerelle	2025-10-23 19:12:32.99	2025-10-23 19:12:32.99
cmh3sudwj000qj5ggqq7qnzwu	fr	checkout.estimatedTotal	Total estimé	2025-10-23 19:12:35.299	2025-10-23 19:12:35.299
cmh3sufld000rj5ggvgt2jr16	fr	checkout.total	Total	2025-10-23 19:12:37.489	2025-10-23 19:12:37.489
cmh3sugu6000sj5ggdfkt8jjr	fr	checkout.placeOrder	Passer la commande	2025-10-23 19:12:39.103	2025-10-23 19:12:39.103
cmh3sui9i000tj5ggol24mzig	fr	checkout.pickupAtPoint	Récupérer à notre point de collecte	2025-10-23 19:12:40.838	2025-10-23 19:12:40.838
cmh3sujo6000uj5gg89i7sarg	fr	checkout.pickupFreeNote	Gratuit (0 frais de livraison)	2025-10-23 19:12:42.775	2025-10-23 19:12:42.775
cmh3suky6000vj5ggyqqwwlt6	fr	checkout.doorToDoor	Livraison à domicile	2025-10-23 19:12:44.431	2025-10-23 19:12:44.431
cmh3sum9q000wj5ggm5e2iohu	fr	checkout.doorFeeNote	Frais de livraison applicables par ville	2025-10-23 19:12:46.142	2025-10-23 19:12:46.142
cmh3svew1000xj5ggzj1980al	fr	home.categories.title	Catégories	2025-10-23 19:13:23.233	2025-10-23 19:13:23.233
cmh3svh8v000yj5ggqza06fm1	fr	home.categories.error	Échec du chargement des catégories.	2025-10-23 19:13:26.287	2025-10-23 19:13:26.287
cmh3svixw000zj5ggenzjsmnu	fr	home.featured.tagline	découvrez nos	2025-10-23 19:13:28.484	2025-10-23 19:13:28.484
cmh3svlwg0010j5ggzso4owtt	fr	home.featured.title	Produits phares	2025-10-23 19:13:32.32	2025-10-23 19:13:32.32
cmh3svnw20011j5gg3ywjxekl	fr	home.featured.description	Articles triés sur le volet qui représentent le meilleur de la mode, de la qualité et du style. Chaque pièce est soigneusement sélectionnée pour vous offrir les dernières tendances et les classiques intemporels.	2025-10-23 19:13:34.768	2025-10-23 19:13:34.768
cmh3svpc20012j5ggj7fgdnns	fr	home.featured.viewAll	Voir tous les produits	2025-10-23 19:13:36.77	2025-10-23 19:13:36.77
cmh3sw7m70013j5ggav2abv1d	fr	home.newsletter.subscribed	Abonné(e) !	2025-10-23 19:14:00.463	2025-10-23 19:14:00.463
cmh3sw9p60014j5gghfcgb1rm	fr	home.newsletter.disclaimer	Pas de spam, désabonnez-vous à tout moment. Nous respectons votre vie privée.	2025-10-23 19:14:03.162	2025-10-23 19:14:03.162
cmh3x4ie20000j55hlixoeszk	ar	product.wishlistAdded	تمت الإضافة إلى قائمة الأمنيات	2025-10-23 21:12:24.978	2025-10-23 21:12:24.978
cmh4jrivp0000j5ozida0vhd4	fr	footer.about	À propos de nous	2025-10-24 07:46:11.413	2025-10-24 07:46:11.413
cmh4jrm320001j5ozjojcdfdv	fr	footer.contact	Contact	2025-10-24 07:46:15.567	2025-10-24 07:46:15.567
cmh4jro7k0002j5ozpzmq2ola	fr	footer.terms	Conditions d'utilisation	2025-10-24 07:46:18.128	2025-10-24 07:46:18.128
cmh4jrq430003j5ozpba49x3s	fr	footer.privacy	Politique de confidentialité	2025-10-24 07:46:20.788	2025-10-24 07:46:20.788
cmh4jrrjb0004j5oz13p7oho0	fr	footer.copyright	Tous droits réservés	2025-10-24 07:46:22.631	2025-10-24 07:46:22.631
cmh4jrsaq0005j5ozmxlr5w7k	fr	product.addToWishlist	Ajouter à la liste de souhaits	2025-10-24 07:46:23.619	2025-10-24 07:46:23.619
cmh4jrv0c0006j5oz7pc4e88j	fr	product.wishlistAdded	Ajouté à la liste de souhaits	2025-10-24 07:46:27.132	2025-10-24 07:46:27.132
cmh4jrvvq0007j5ozexahlhq7	fr	product.wishlistRemoved	Supprimé de la liste de souhaits	2025-10-24 07:46:28.263	2025-10-24 07:46:28.263
cmh4jrwrq0008j5oz97uezh24	fr	product.wishlistActionFailed	L'action sur la liste de souhaits a échoué	2025-10-24 07:46:29.414	2025-10-24 07:46:29.414
cmh4jrxgc0009j5ozruc1lswr	fr	product.quantity	Quantité	2025-10-24 07:46:30.3	2025-10-24 07:46:30.3
cmh4jrycb000aj5oz9rg911sl	fr	product.inWishlist	Dans la liste de souhaits	2025-10-24 07:46:31.452	2025-10-24 07:46:31.452
cmh4js9e4000bj5ozj7dgrlo7	fr	product.returnPolicy30d	Politique de retour de 30 jours	2025-10-24 07:46:45.772	2025-10-24 07:46:45.772
cmh4jssfk000cj5ozdr1rv776	fr	home.hero.slide1.cta	Explorer la collection	2025-10-24 07:47:10.448	2025-10-24 07:47:10.448
cmh4jsuuy000dj5ozta1683kw	fr	home.hero.slide2.title	Tendances du moment	2025-10-24 07:47:13.594	2025-10-24 07:47:13.594
cmh4jsvoa000ej5oz7izoo2li	fr	home.hero.slide2.text	Gardez une longueur d'avance avec les dernières tendances de la mode et des pièces exclusives.	2025-10-24 07:47:14.65	2025-10-24 07:47:14.65
cmh4jsww7000fj5oz34f29ap0	fr	home.hero.slide2.cta	Tendances de la boutique	2025-10-24 07:47:16.231	2025-10-24 07:47:16.231
cmh4jsyoc000gj5ozl8ssd4w7	fr	home.hero.slide3.title	Nouveaux arrivages	2025-10-24 07:47:18.541	2025-10-24 07:47:18.541
cmh4jt231000hj5ozs6ivns1k	fr	home.hero.slide3.text	Nouveaux styles viennent d'arriver - soyez le premier à les porter	2025-10-24 07:47:22.958	2025-10-24 07:47:22.958
cmh4jt44k000ij5ozfu036nol	fr	home.hero.slide3.cta	Découvrir les nouveautés	2025-10-24 07:47:25.605	2025-10-24 07:47:25.605
cmh4jt6ig000jj5ozpuagb876	fr	home.categories.tagline	explorer	2025-10-24 07:47:28.696	2025-10-24 07:47:28.696
cmh4jt8sb000kj5ozkxc6i52g	fr	home.testimonials.tagline	ce que disent nos clients	2025-10-24 07:47:31.643	2025-10-24 07:47:31.643
cmh4jtdix000lj5ozw81pplbc	fr	home.testimonials.title	Témoignages	2025-10-24 07:47:37.574	2025-10-24 07:47:37.574
cmh4jti9p000mj5oz503qs7f1	fr	home.brands.subtitle	Nous collaborons avec les marques de mode les plus emblématiques au monde	2025-10-24 07:47:43.934	2025-10-24 07:47:43.934
cmh4ju4mt000nj5ozpgite7rg	es	common.signOut	Cerrar sesión	2025-10-24 07:48:12.917	2025-10-24 07:48:12.917
cmh4ju8i5000oj5ozsap4i4he	es	common.profile	Perfil	2025-10-24 07:48:17.933	2025-10-24 07:48:17.933
cmh4jub41000pj5ozxk3t1l7f	es	common.admin	Panel de control de administrador	2025-10-24 07:48:21.313	2025-10-24 07:48:21.313
cmh4jueqo000qj5ozolrbgauj	es	products.loading	Cargando...	2025-10-24 07:48:25.819	2025-10-24 07:48:25.819
cmh4juhtt000rj5ozglqy4i0g	es	products.showingLabel	Mostrando	2025-10-24 07:48:30.018	2025-10-24 07:48:30.018
cmh4jukw3000sj5oz4xha0yhg	es	products.of	de	2025-10-24 07:48:33.987	2025-10-24 07:48:33.987
cmh4juqub000tj5ozvvogb23y	es	products.featured	Destacado	2025-10-24 07:48:41.589	2025-10-24 07:48:41.589
cmh4jusy1000uj5ozmzwdcsgj	es	products.priceLow	Precio: De menor a mayor	2025-10-24 07:48:44.426	2025-10-24 07:48:44.426
cmh4juv0v000vj5ozaeql09yw	es	products.priceHigh	Precio: De mayor a menor	2025-10-24 07:48:47.119	2025-10-24 07:48:47.119
cmh4juwlp000wj5ozd0bw9b39	es	products.nameAsc	Nombre: A → Z	2025-10-24 07:48:49.165	2025-10-24 07:48:49.165
cmh4jv0sr000xj5oz1k1x4ohr	es	products.loadMore	Cargar más productos	2025-10-24 07:48:54.604	2025-10-24 07:48:54.604
cmh4jvejg000yj5ozd0m8z5i3	es	footer.contact	Contacto	2025-10-24 07:49:12.412	2025-10-24 07:49:12.412
cmh4jvgij000zj5oz8vqbusf3	es	footer.terms	Términos de servicio	2025-10-24 07:49:14.971	2025-10-24 07:49:14.971
cmh4jvjil0010j5ozdt3kaqdm	es	footer.privacy	Política de privacidad	2025-10-24 07:49:18.861	2025-10-24 07:49:18.861
cmh4jvm1p0011j5oz00dci3xd	es	footer.copyright	Todos los derechos reservados	2025-10-24 07:49:22.141	2025-10-24 07:49:22.141
cmh4jvotg0012j5ozvet4q3c6	es	product.addToWishlist	Añadir a la lista de deseos	2025-10-24 07:49:25.732	2025-10-24 07:49:25.732
cmh4jvr3y0013j5ozy2p2t4qf	es	product.outOfStock	Agotado	2025-10-24 07:49:28.591	2025-10-24 07:49:28.591
cmh4jvtt00014j5ozghnl3708	es	product.inStock	En existencia	2025-10-24 07:49:32.197	2025-10-24 07:49:32.197
cmh4jvvqj0015j5oz96r9vedj	es	product.available	disponible	2025-10-24 07:49:34.699	2025-10-24 07:49:34.699
cmh4jvxyr0016j5ozcpzpioq1	es	product.price	Precio	2025-10-24 07:49:37.588	2025-10-24 07:49:37.588
cmh4k0pv20017j5ozl0zy9kiy	es	product.description	Descripción	2025-10-24 07:53:19.287	2025-10-24 07:53:19.287
cmh4k0tlg0018j5oz8vdbackp	es	product.reviews	Reseñas	2025-10-24 07:53:25.204	2025-10-24 07:53:25.204
cmh4k11oe0019j5oz6qsk6grf	es	product.noRating	Sin calificar	2025-10-24 07:53:35.482	2025-10-24 07:53:35.482
cmh4k17pa001aj5oze81wihwr	es	product.newBadge	NUEVO	2025-10-24 07:53:43.487	2025-10-24 07:53:43.487
cmh4k19en001bj5ozt06o7lr0	zh	common.home	首页	2025-10-24 07:53:45.695	2025-10-24 07:53:45.695
cmh4m7un1001cj5oz70zqzjen	fr	product.wishlist	Liste de souhaits	2025-10-24 08:54:52.381	2025-10-24 08:54:52.381
cmh4oqmlm001dj5ozsgpi8x4x	fr	product.adding	Ajout…	2025-10-24 10:05:27.493	2025-10-24 10:05:27.493
cmh4oqoa3001ej5ozp9p10u20	fr	product.taxIncluded	Taxes incluses et frais d’envoi calculés lors du paiement	2025-10-24 10:05:29.835	2025-10-24 10:05:29.835
cmh4oqps1001fj5ozk3erwyrs	fr	product.whyChoose	Pourquoi choisir ce produit ?	2025-10-24 10:05:31.777	2025-10-24 10:05:31.777
cmh4oqra4001gj5ozbpikk3p1	fr	product.freeShippingOverPrefix	Livraison Gratuite sur les commandes de plus de	2025-10-24 10:05:33.724	2025-10-24 10:05:33.724
cmh4oqsgq001hj5oz9g75mdb9	fr	product.yearWarranty	Garantie de 1 an incluse	2025-10-24 10:05:35.258	2025-10-24 10:05:35.258
cmh4oqtom001ij5oztnk2wq92	fr	product.copiedLink	Lien copié sur le presse-papiers	2025-10-24 10:05:36.838	2025-10-24 10:05:36.838
cmh4oqv0e001jj5ozx4qqk372	fr	checkout.title	Départ	2025-10-24 10:05:38.558	2025-10-24 10:05:38.558
cmh4oqwn4001kj5ozlf5ofayl	fr	checkout.deliveryMethod	Mode de livraison	2025-10-24 10:05:40.672	2025-10-24 10:05:40.672
cmh4or1sl001lj5ozmzz3klys	fr	checkout.pickupCity	Ville du point de retrait	2025-10-24 10:05:47.349	2025-10-24 10:05:47.349
cmh4or3g5001mj5oz4h8yadru	fr	checkout.city	Ville	2025-10-24 10:05:49.494	2025-10-24 10:05:49.494
cmh4or59g001nj5oze8goflfo	fr	checkout.selectCity	Sélectionner une ville	2025-10-24 10:05:51.845	2025-10-24 10:05:51.845
cmh4or6or001oj5ozb1jotpam	fr	checkout.pickupLocation	Lieu de prise en charge	2025-10-24 10:05:53.692	2025-10-24 10:05:53.692
cmh4or87b001pj5ozqj3z9qct	fr	checkout.selectLocation	Sélectionner un emplacement	2025-10-24 10:05:55.655	2025-10-24 10:05:55.655
cmh4or9c6001qj5oz4fh5mr9p	fr	home.hero.slide1.title	Faites monter d'un cran votre style	2025-10-24 10:05:57.126	2025-10-24 10:05:57.126
cmh4orat2001rj5oz0ym44z0o	fr	home.hero.slide1.text	Découvrez une mode haut de gamme qui définit votre personnalité unique	2025-10-24 10:05:58.914	2025-10-24 10:05:58.914
cmh4org8h001sj5ozslzfsodd	fr	home.brands.title	Les marques du monde entier nous font confiance	2025-10-24 10:06:06.066	2025-10-24 10:06:06.066
cmh4orhzm001tj5ozssqsloq6	fr	home.newsletter.title	Ne manquez rien	2025-10-24 10:06:08.339	2025-10-24 10:06:08.339
cmh4orjsw001uj5ozt5p1ka39	fr	home.newsletter.description	Soyez le premier informé des nouveautés, des offres exclusives et des conseils de mode. Rejoignez notre communauté de passionnés de mode et ne manquez jamais une tendance.	2025-10-24 10:06:10.689	2025-10-24 10:06:10.689
cmh4orkw3001vj5ozbgjez86b	fr	home.newsletter.placeholder	Indiquez votre adresse e-mail	2025-10-24 10:06:12.099	2025-10-24 10:06:12.099
cmh4ormc7001wj5oz3ab1zf91	fr	home.newsletter.subscribe	S'abonner	2025-10-24 10:06:13.975	2025-10-24 10:06:13.975
cmh4orqoe001xj5ozwtxwpcvt	es	common.home	Inicio	2025-10-24 10:06:19.599	2025-10-24 10:06:19.599
cmh4ors12001yj5ozu0y1jy6o	es	common.products	Productos	2025-10-24 10:06:21.35	2025-10-24 10:06:21.35
cmh4ortuc001zj5oz2wcputlg	es	common.cart	Carro	2025-10-24 10:06:23.7	2025-10-24 10:06:23.7
cmh4orv9h0020j5ozq2eypsjh	es	common.wishlist	Lista de deseos	2025-10-24 10:06:25.542	2025-10-24 10:06:25.542
cmh4orwg50021j5ozud7j8a9u	es	common.search	Buscar	2025-10-24 10:06:27.077	2025-10-24 10:06:27.077
cmh4orxfu0022j5oz79yj4z6b	es	common.signIn	Iniciar sesión	2025-10-24 10:06:28.362	2025-10-24 10:06:28.362
cmh4os1ze0023j5ozq1m2qyd1	es	products.nameDesc	Nombre: Z-A	2025-10-24 10:06:34.25	2025-10-24 10:06:34.25
cmh4os3sy0024j5ozx7embthw	es	nav.newArrivals	Novedades	2025-10-24 10:06:36.611	2025-10-24 10:06:36.611
cmh4os4t50025j5oznvrn9l9o	es	nav.men	Hombres	2025-10-24 10:06:37.913	2025-10-24 10:06:37.913
cmh4os6so0026j5ozakwy4cgq	es	nav.women	Mujeres	2025-10-24 10:06:40.489	2025-10-24 10:06:40.489
cmh4os86s0027j5oziz7dkpgi	es	nav.accessories	Accesorios	2025-10-24 10:06:42.292	2025-10-24 10:06:42.292
cmh4osalt0028j5ozd9iv9ra8	es	nav.sale	Venta	2025-10-24 10:06:45.219	2025-10-24 10:06:45.219
cmh4osc380029j5ozko90pphs	es	footer.about	¿Quiénes somos?	2025-10-24 10:06:47.348	2025-10-24 10:06:47.348
cmh4ov1tu0040j5oz6fp0kror	zh	common.cart	购物	2025-10-24 10:08:54.018	2025-10-24 10:08:54.018
cmh4osf9b002aj5ozn517uzjw	es	product.addedToCart	Añadida	2025-10-24 10:06:51.456	2025-10-24 10:06:51.456
cmh4osgsg002bj5oziossx28x	es	product.signInToSyncCart	Inicia sesión para sincronizar tu carrito	2025-10-24 10:06:53.44	2025-10-24 10:06:53.44
cmh4osikm002cj5oz7y4d6dx1	es	product.itemKeptLocally	Artículo guardado localmente.	2025-10-24 10:06:55.751	2025-10-24 10:06:55.751
cmh4osk5g002dj5ozn2erxy8r	es	product.failedToSyncCart	Error al sincronizar el carrito	2025-10-24 10:06:57.796	2025-10-24 10:06:57.796
cmh4osl7n002ej5ozy9ofgui7	es	product.wishlistAdded	Agregado a favoritos	2025-10-24 10:06:59.171	2025-10-24 10:06:59.171
cmh4osmli002fj5oz0mjb0fms	es	product.wishlistRemoved	¡Eliminado de tus favoritos!	2025-10-24 10:07:00.607	2025-10-24 10:07:00.607
cmh4oso1m002gj5oz1u4etbjx	es	product.wishlistActionFailed	Error en la acción de la lista de deseos	2025-10-24 10:07:02.842	2025-10-24 10:07:02.842
cmh4ospfi002hj5ozg5b2ji9l	es	product.quantity	Cantidad	2025-10-24 10:07:04.638	2025-10-24 10:07:04.638
cmh4osr2v002ij5ozqun0xv15	es	product.inWishlist	en la lista de deseos	2025-10-24 10:07:06.776	2025-10-24 10:07:06.776
cmh4ossiz002jj5oztec0eh2t	es	product.wishlist	Lista de deseos	2025-10-24 10:07:08.651	2025-10-24 10:07:08.651
cmh4ostp7002kj5ozy2nl49z0	es	product.adding	Añadiendo...	2025-10-24 10:07:10.171	2025-10-24 10:07:10.171
cmh4osv2f002lj5ozbkgl7fpf	es	product.taxIncluded	Impuestos incluidos y envío calculado al finalizar la compra	2025-10-24 10:07:11.943	2025-10-24 10:07:11.943
cmh4oswey002mj5oz800ijd4b	es	product.whyChoose	Por qué elegir este producto	2025-10-24 10:07:13.69	2025-10-24 10:07:13.69
cmh4osygj002nj5ozxx3uznco	es	product.freeShippingOverPrefix	Envío gratis en pedidos superiores a {0}	2025-10-24 10:07:16.193	2025-10-24 10:07:16.193
cmh4oszma002oj5oz6b6smot3	es	product.yearWarranty	1 año de garantía de hardware incluida	2025-10-24 10:07:17.843	2025-10-24 10:07:17.843
cmh4ot1jp002pj5ozjdyebww1	es	product.returnPolicy30d	Derecho de devolución en 30 días	2025-10-24 10:07:20.341	2025-10-24 10:07:20.341
cmh4ot2vj002qj5oz126mrncn	es	product.copiedLink	Enlace copiado al portapapeles	2025-10-24 10:07:22.063	2025-10-24 10:07:22.063
cmh4ot4ar002rj5ozsir34ohd	es	checkout.title	Pago	2025-10-24 10:07:23.907	2025-10-24 10:07:23.907
cmh4ot647002sj5ozzhh3dlig	es	checkout.deliveryMethod	Método de entrega	2025-10-24 10:07:26.263	2025-10-24 10:07:26.263
cmh4ot7xx002tj5ozposg6pij	es	checkout.pickup	Recogida	2025-10-24 10:07:28.629	2025-10-24 10:07:28.629
cmh4ot9wq002uj5ozz8h2tp0t	es	checkout.door	Dorëzimi  në derë	2025-10-24 10:07:31.178	2025-10-24 10:07:31.178
cmh4otbnq002vj5ozzzi5s2fj	es	checkout.shippingFee	Costo de envío	2025-10-24 10:07:33.446	2025-10-24 10:07:33.446
cmh4otdgr002wj5oz1b72hf85	es	checkout.gatewayFee	Precio de la pasarela	2025-10-24 10:07:35.788	2025-10-24 10:07:35.788
cmh4otevu002xj5oz8kn3e5bo	es	checkout.estimatedTotal	Total estimado	2025-10-24 10:07:37.626	2025-10-24 10:07:37.626
cmh4otg90002yj5oziyo3qdug	es	checkout.total	Total	2025-10-24 10:07:39.396	2025-10-24 10:07:39.396
cmh4oticd002zj5oz95kmzix2	es	checkout.placeOrder	Pagar	2025-10-24 10:07:42.109	2025-10-24 10:07:42.109
cmh4otjv50030j5ozp7cc0wx5	es	checkout.pickupAtPoint	Recogida en nuestro punto de recogida	2025-10-24 10:07:44.082	2025-10-24 10:07:44.082
cmh4otlgd0031j5ozvdbtzfz5	es	checkout.pickupFreeNote	Gratis (0 gastos de envío)	2025-10-24 10:07:46.142	2025-10-24 10:07:46.142
cmh4otmnt0032j5ozel46mt9q	es	checkout.doorToDoor	Entrega a Domicilio.	2025-10-24 10:07:47.575	2025-10-24 10:07:47.575
cmh4oto7s0033j5ozeckl8k54	es	checkout.doorFeeNote	Se aplican gastos de envío por ciudad	2025-10-24 10:07:49.72	2025-10-24 10:07:49.72
cmh4otph30034j5oz8i3j690b	es	checkout.pickupCity	Ciudad de recogida	2025-10-24 10:07:51.351	2025-10-24 10:07:51.351
cmh4otqla0035j5oz7lxucutd	es	checkout.city	Ciudad	2025-10-24 10:07:52.799	2025-10-24 10:07:52.799
cmh4otrqe0036j5ozurb61qp5	es	checkout.selectCity	Seleccionar ciudad	2025-10-24 10:07:54.279	2025-10-24 10:07:54.279
cmh4otti60037j5oztmbdw2di	es	checkout.pickupLocation	Lugar de recogida	2025-10-24 10:07:56.574	2025-10-24 10:07:56.574
cmh4otumw0038j5oz3x0xfsl4	es	checkout.selectLocation	Seleccione la ubicación	2025-10-24 10:07:58.04	2025-10-24 10:07:58.04
cmh4otwfe0039j5oz6e4w91ur	es	home.hero.slide1.title	Eleva tu estilo.	2025-10-24 10:08:00.362	2025-10-24 10:08:00.362
cmh4oty14003aj5ozxl0mw6uq	es	home.hero.slide1.text	Descubre la moda premium que define tu personalidad única	2025-10-24 10:08:02.44	2025-10-24 10:08:02.44
cmh4otzzz003bj5ozqne3pfw2	es	home.hero.slide1.cta	Explorar temas	2025-10-24 10:08:04.991	2025-10-24 10:08:04.991
cmh4ou21g003cj5ozza7hx5a9	es	home.hero.slide2.title	Más Buscados	2025-10-24 10:08:07.636	2025-10-24 10:08:07.636
cmh4ou3ju003dj5ozsdra4hoi	es	home.hero.slide2.text	Mantente a la vanguardia con las últimas tendencias de moda y piezas exclusivas	2025-10-24 10:08:09.594	2025-10-24 10:08:09.594
cmh4ou57j003ej5ozym2khr52	es	home.hero.slide2.cta	Compra tendencias	2025-10-24 10:08:11.743	2025-10-24 10:08:11.743
cmh4ou6pd003fj5oztedg0e3p	es	home.hero.slide3.title	Novedades	2025-10-24 10:08:13.681	2025-10-24 10:08:13.681
cmh4ou8a1003gj5oz2b3voqmm	es	home.hero.slide3.text	Los estilos frescos acaban de aterrizar: sé el primero en usarlos	2025-10-24 10:08:15.722	2025-10-24 10:08:15.722
cmh4ou9mf003hj5ozhc2gkw7i	es	home.hero.slide3.cta	Ver las novedades	2025-10-24 10:08:17.463	2025-10-24 10:08:17.463
cmh4ouba4003ij5oztdss2un8	es	home.categories.tagline	explorar	2025-10-24 10:08:19.411	2025-10-24 10:08:19.411
cmh4oucv1003jj5oz1z38symw	es	home.categories.title	Categorías	2025-10-24 10:08:21.661	2025-10-24 10:08:21.661
cmh4oudyr003kj5ozo4kq65zx	es	home.categories.error	No se han podido cargar las categorías.	2025-10-24 10:08:23.092	2025-10-24 10:08:23.092
cmh4oufti003lj5oz9jxn033c	es	home.featured.tagline	¡Descubre nuestro	2025-10-24 10:08:25.494	2025-10-24 10:08:25.494
cmh4ougya003mj5oz6k6d1a79	es	home.featured.title	Productos Destacados	2025-10-24 10:08:26.962	2025-10-24 10:08:26.962
cmh4ouigy003nj5ozeoqhh57j	es	home.featured.description	Artículos cuidadosamente seleccionados que representan lo mejor de la moda, la calidad y el estilo. Cada pieza está cuidadosamente seleccionada para ofrecerte las últimas tendencias y clásicos atemporales.	2025-10-24 10:08:28.931	2025-10-24 10:08:28.931
cmh4oujrn003oj5ozeblr3eaw	es	home.featured.viewAll	Ver todos los productos	2025-10-24 10:08:30.611	2025-10-24 10:08:30.611
cmh4oul4q003pj5oz8kh6jmy0	es	home.testimonials.tagline	Lo que dicen nuestros clientes	2025-10-24 10:08:32.378	2025-10-24 10:08:32.378
cmh4oum9q003qj5oz7iyxn8e8	es	home.testimonials.title	Testimonios	2025-10-24 10:08:33.855	2025-10-24 10:08:33.855
cmh4ouo0v003rj5oz4wlu8oxv	es	home.brands.title	Con la confianza de marcas de todo el mundo.	2025-10-24 10:08:36.002	2025-10-24 10:08:36.002
cmh4oupi2003sj5ozhv5tp2nd	es	home.brands.subtitle	Nos asociamos con las marcas de moda más emblemáticas del mundo	2025-10-24 10:08:38.042	2025-10-24 10:08:38.042
cmh4ouqpl003tj5ozabzu6x7d	es	home.newsletter.title	Permanecer actualizado	2025-10-24 10:08:39.609	2025-10-24 10:08:39.609
cmh4ous6v003uj5oz1c4829xy	es	home.newsletter.description	Sé el primero en enterarte de las novedades, las ofertas exclusivas y los consejos de moda. Únete a nuestra comunidad de entusiastas del estilo y no te pierdas ninguna tendencia.	2025-10-24 10:08:41.527	2025-10-24 10:08:41.527
cmh4outgc003vj5ozhrthem8p	es	home.newsletter.placeholder	Escribe tu dirección de correo electrónico	2025-10-24 10:08:43.165	2025-10-24 10:08:43.165
cmh4ouun4003wj5ozszi8eqjk	es	home.newsletter.subscribe	Suscribirse	2025-10-24 10:08:44.705	2025-10-24 10:08:44.705
cmh4ouwgq003xj5oztrh64lcb	es	home.newsletter.subscribed	¡Suscrito!	2025-10-24 10:08:47.067	2025-10-24 10:08:47.067
cmh4ouxpx003yj5ozz8x9p2o5	es	home.newsletter.disclaimer	Sin spam, cancela la suscripción en cualquier momento. Respetamos tu privacidad.	2025-10-24 10:08:48.693	2025-10-24 10:08:48.693
cmh4ov0bw003zj5oztqj1mycr	zh	common.products	产品	2025-10-24 10:08:52.076	2025-10-24 10:08:52.076
cmh4ov2yp0041j5ozt9ytbh52	zh	common.wishlist	收藏	2025-10-24 10:08:55.489	2025-10-24 10:08:55.489
cmh4ov4780042j5ozo9x07bjf	zh	common.search	搜索	2025-10-24 10:08:57.092	2025-10-24 10:08:57.092
cmh4ov5e50043j5ozz8fdnv02	zh	common.signIn	登入	2025-10-24 10:08:58.637	2025-10-24 10:08:58.637
cmh4ov7di0044j5ozczx1o5q4	zh	common.signOut	注销	2025-10-24 10:09:01.206	2025-10-24 10:09:01.206
cmh4ov8l70045j5ozltchp1km	zh	common.profile	個人檔案	2025-10-24 10:09:02.779	2025-10-24 10:09:02.779
cmh4ovaaf0046j5ozkh060yfr	zh	common.admin	管理控制面板	2025-10-24 10:09:04.984	2025-10-24 10:09:04.984
cmh4ovbpn0047j5ozpbptfbwt	zh	products.loading	正在載入...	2025-10-24 10:09:06.695	2025-10-24 10:09:06.695
cmh4ovcsn0048j5ozpbp4r0a1	zh	products.showingLabel	显示	2025-10-24 10:09:08.232	2025-10-24 10:09:08.232
cmh4ovee30049j5oz95zbxv60	zh	products.of	/	2025-10-24 10:09:10.3	2025-10-24 10:09:10.3
cmh4ovg2i004aj5ozsbjfd7qf	zh	products.featured	編輯推薦	2025-10-24 10:09:12.474	2025-10-24 10:09:12.474
cmh4ovhg0004bj5ozqz068cqb	zh	products.priceLow	价格：从低到高	2025-10-24 10:09:14.256	2025-10-24 10:09:14.256
cmh4ovipv004cj5ozuj4qgq2p	zh	products.priceHigh	价格：从高到低	2025-10-24 10:09:15.908	2025-10-24 10:09:15.908
cmh4ovjnx004dj5ozniju7j9g	zh	products.nameAsc	名称（A-Z）	2025-10-24 10:09:17.133	2025-10-24 10:09:17.133
cmh4ovlcf004ej5ozoa566l56	zh	products.nameDesc	名称（Z-A）	2025-10-24 10:09:19.311	2025-10-24 10:09:19.311
cmh4ovmri004fj5oz2kwnhofy	zh	products.loadMore	加载更多产品	2025-10-24 10:09:21.151	2025-10-24 10:09:21.151
cmh4ovowo004gj5ozg8vzzfz0	zh	nav.newArrivals	新进商品	2025-10-24 10:09:23.576	2025-10-24 10:09:23.576
cmh4ovqss004hj5ozy7qb71dh	zh	nav.men	男性	2025-10-24 10:09:26.38	2025-10-24 10:09:26.38
cmh4ovsdp004ij5ozd240kg39	zh	nav.women	女性	2025-10-24 10:09:28.429	2025-10-24 10:09:28.429
cmh4ovtz7004jj5ozyd184plq	zh	nav.accessories	配飾	2025-10-24 10:09:30.499	2025-10-24 10:09:30.499
cmh4ovvij004kj5oz1fysjgx3	zh	nav.sale	促销	2025-10-24 10:09:32.492	2025-10-24 10:09:32.492
cmh4ovwyl004lj5oz08kf6ei5	zh	footer.about	关于我们	2025-10-24 10:09:34.365	2025-10-24 10:09:34.365
cmh4ovya7004mj5ozeq7afchf	zh	footer.contact	連絡人	2025-10-24 10:09:36.079	2025-10-24 10:09:36.079
cmh4ovzff004nj5ozlglwnvyn	zh	footer.terms	服務條款	2025-10-24 10:09:37.564	2025-10-24 10:09:37.564
cmh4ow0zm004oj5ozijko5qz6	zh	footer.privacy	隐私条款	2025-10-24 10:09:38.988	2025-10-24 10:09:38.988
cmh4ow2kv004pj5ozeks6sib2	zh	footer.copyright	版权所有	2025-10-24 10:09:41.647	2025-10-24 10:09:41.647
cmh4ow3s2004qj5oza4qddtzh	zh	product.addToCart	添加到购物车: 颜色	2025-10-24 10:09:43.203	2025-10-24 10:09:43.203
cmh4ow5ko004rj5ozv3ozkac9	zh	product.outOfStock	无货	2025-10-24 10:09:45.529	2025-10-24 10:09:45.529
cmh4ow75t004sj5ozeyfms7o6	zh	product.inStock	有货	2025-10-24 10:09:47.585	2025-10-24 10:09:47.585
cmh4ow8lu004tj5oz22l7ek2t	zh	product.available	可用	2025-10-24 10:09:49.458	2025-10-24 10:09:49.458
cmh4ow9fi004uj5oz0y3kalvy	zh	product.price	价格	2025-10-24 10:09:50.527	2025-10-24 10:09:50.527
cmh4owamr004vj5oz7kvjzak9	zh	product.description	Description	2025-10-24 10:09:52.083	2025-10-24 10:09:52.083
cmh4owc21004wj5ozwb31wr0p	zh	product.reviews	評論	2025-10-24 10:09:53.929	2025-10-24 10:09:53.929
cmh4owdmn004xj5ozah0pztsc	zh	product.noRating	没有评级	2025-10-24 10:09:55.79	2025-10-24 10:09:55.79
cmh4owf8m004yj5ozcqtz6psu	zh	product.newBadge	新增	2025-10-24 10:09:58.055	2025-10-24 10:09:58.055
cmh4owghs004zj5ozeqqtt0st	zh	product.addedToCart	加入购物车	2025-10-24 10:09:59.68	2025-10-24 10:09:59.68
cmh4owhz70050j5ozmhbz8dck	zh	product.signInToSyncCart	登录以同步购物车	2025-10-24 10:10:01.603	2025-10-24 10:10:01.603
cmh4owjpw0051j5ozyffc4m5k	zh	product.failedToSyncCart	失败	2025-10-24 10:10:03.86	2025-10-24 10:10:03.86
cmh4owl510052j5ozkbs91zbg	zh	product.wishlistAdded	已赞	2025-10-24 10:10:05.701	2025-10-24 10:10:05.701
cmh4owmcf0053j5ozqvd391ix	zh	product.wishlistRemoved	取赞	2025-10-24 10:10:07.264	2025-10-24 10:10:07.264
cmh4ownlg0054j5ozm4v2szmt	zh	product.wishlistActionFailed	心愿单操作失败	2025-10-24 10:10:08.885	2025-10-24 10:10:08.885
cmh4owqgv0055j5oz0wl83hfi	zh	product.quantity	数量	2025-10-24 10:10:10.819	2025-10-24 10:10:10.819
cmh4owrxu0056j5oz6xbpsfmh	zh	product.inWishlist	愿望清单：	2025-10-24 10:10:14.514	2025-10-24 10:10:14.514
cmh4owt730057j5oz04vtai2w	zh	product.wishlist	收藏	2025-10-24 10:10:16.143	2025-10-24 10:10:16.143
cmh4owuel0058j5oz9hsiehpe	zh	product.adding	正在添加...	2025-10-24 10:10:17.709	2025-10-24 10:10:17.709
cmh4owvnk0059j5ozqxaomule	zh	product.taxIncluded	含税。运费在结账时计算。	2025-10-24 10:10:19.328	2025-10-24 10:10:19.328
cmh4owx2q005aj5ozfeau19c9	zh	product.whyChoose	为什么选择此产品	2025-10-24 10:10:21.171	2025-10-24 10:10:21.171
cmh4owy44005bj5ozjcwhn60l	zh	product.freeShippingOverPrefix	订单免费送货	2025-10-24 10:10:22.517	2025-10-24 10:10:22.517
cmh4owz80005cj5oz4h20z0f3	zh	product.yearWarranty	含1年保修	2025-10-24 10:10:23.952	2025-10-24 10:10:23.952
cmh4ox0sg005dj5ozk5i69it6	zh	product.returnPolicy30d	* 30天退货政策	2025-10-24 10:10:25.985	2025-10-24 10:10:25.985
cmh4ox2d6005ej5ozsnd8xi1u	zh	product.copiedLink	链接到剪贴板	2025-10-24 10:10:27.69	2025-10-24 10:10:27.69
cmh4ox3n7005fj5ozhwnawfxq	zh	checkout.title	结账	2025-10-24 10:10:29.683	2025-10-24 10:10:29.683
cmh4ox54x005gj5oz3phhwe1f	zh	checkout.deliveryMethod	交货方式	2025-10-24 10:10:31.617	2025-10-24 10:10:31.617
cmh4ox76v005hj5ozn1nk5cga	zh	checkout.pickup	取货	2025-10-24 10:10:34.279	2025-10-24 10:10:34.279
cmh4ox8it005ij5ozeu3jiq4e	zh	checkout.door	送货上门	2025-10-24 10:10:36.005	2025-10-24 10:10:36.005
cmh4oxa0v005jj5ozwaxxwm93	zh	checkout.shippingFee	运费	2025-10-24 10:10:37.952	2025-10-24 10:10:37.952
cmh4oxbrk005kj5oz8rwtj7ci	zh	checkout.gatewayFee	网关已禁用	2025-10-24 10:10:40.208	2025-10-24 10:10:40.208
cmh4oxdfg005lj5ozslr43mx1	zh	checkout.estimatedTotal	估计总数	2025-10-24 10:10:42.364	2025-10-24 10:10:42.364
cmh4oxeul005mj5ozmabg57ft	zh	checkout.total	合计	2025-10-24 10:10:43.997	2025-10-24 10:10:43.997
cmh4oxgi9005nj5oz41dbfg5n	zh	checkout.placeOrder	下订单	2025-10-24 10:10:46.354	2025-10-24 10:10:46.354
cmh4oxidh005oj5ozcp0698a3	zh	checkout.pickupAtPoint	在我们的上车地点上车	2025-10-24 10:10:48.774	2025-10-24 10:10:48.774
cmh4oxjod005pj5ozs7fxvkcc	zh	checkout.pickupFreeNote	免费（派送费优惠）	2025-10-24 10:10:50.462	2025-10-24 10:10:50.462
cmh4oxkun005qj5ozf3j1gg16	zh	checkout.doorToDoor	点对点派送	2025-10-24 10:10:51.984	2025-10-24 10:10:51.984
cmh4oxm05005rj5ozcmjp2ecu	zh	checkout.doorFeeNote	按城市收取派送费	2025-10-24 10:10:53.477	2025-10-24 10:10:53.477
cmh4oxnec005sj5oza1e1alve	zh	checkout.pickupCity	上车城市	2025-10-24 10:10:55.284	2025-10-24 10:10:55.284
cmh4oxos7005tj5ozmajkuga0	zh	checkout.city	城市	2025-10-24 10:10:57.079	2025-10-24 10:10:57.079
cmh4oxpzj005uj5oz8wgg4d0b	zh	checkout.selectCity	选择城市	2025-10-24 10:10:58.64	2025-10-24 10:10:58.64
cmh4oxrin005vj5ozuh5l5lrr	zh	checkout.pickupLocation	取车位置	2025-10-24 10:11:00.5	2025-10-24 10:11:00.5
cmh4oxtec005wj5ozi852u8ir	zh	checkout.selectLocation	选择位置	2025-10-24 10:11:03.061	2025-10-24 10:11:03.061
cmh4oxun4005xj5oz1rzkqtx6	zh	home.hero.slide1.title	提升您的风格	2025-10-24 10:11:04.673	2025-10-24 10:11:04.673
cmh4oxwdu005yj5ozv7njvjro	zh	home.hero.slide1.text	探索定义您独特个性的高级时尚	2025-10-24 10:11:06.931	2025-10-24 10:11:06.931
cmh4oxxff005zj5ozyegi0inz	zh	home.hero.slide1.cta	浏览收藏	2025-10-24 10:11:08.283	2025-10-24 10:11:08.283
cmh4oxyod0060j5ozdr9s9gks	zh	home.hero.slide2.title	10大熱搜關鍵字	2025-10-24 10:11:09.902	2025-10-24 10:11:09.902
cmh4oy0rv0061j5ozmwfe15p5	zh	home.hero.slide2.cta	商店趋势	2025-10-24 10:11:12.619	2025-10-24 10:11:12.619
cmh4oy1z40062j5ozkt0xnhzu	zh	home.hero.slide3.title	新进商品	2025-10-24 10:11:14.177	2025-10-24 10:11:14.177
cmh4oy3qf0063j5ozzj3zeb8g	zh	home.hero.slide3.text	新鲜款式刚刚登陆-成为第一个穿上它们的人	2025-10-24 10:11:16.256	2025-10-24 10:11:16.256
cmh4oy5ju0064j5oznuu960tb	zh	home.hero.slide3.cta	查看最新信息	2025-10-24 10:11:18.811	2025-10-24 10:11:18.811
cmh4oy75a0065j5ozz21ulk4d	zh	home.categories.tagline	发现	2025-10-24 10:11:20.879	2025-10-24 10:11:20.879
cmh4oy8c50066j5oz3ceggpbg	zh	home.categories.title	类别	2025-10-24 10:11:22.422	2025-10-24 10:11:22.422
cmh4oy9fa0067j5ozykp5qg8j	zh	home.categories.error	无法加载类别。	2025-10-24 10:11:23.83	2025-10-24 10:11:23.83
cmh4oyaxa0068j5ozpeyv8vdz	zh	home.featured.tagline	了解我们的	2025-10-24 10:11:25.774	2025-10-24 10:11:25.774
cmh4oybz90069j5ozkg67swz2	zh	home.featured.title	精选产品	2025-10-24 10:11:27.142	2025-10-24 10:11:27.142
cmh4oyd7s006aj5ozib9rclxi	zh	home.featured.description	代表最佳时尚、品质和风格的精心挑选的物品。每件作品都经过精心挑选，为您带来最新潮流和永恒的经典。	2025-10-24 10:11:28.744	2025-10-24 10:11:28.744
cmh4oyeep006bj5oze4fjyt4a	zh	home.featured.viewAll	查看所有产品 %s	2025-10-24 10:11:30.289	2025-10-24 10:11:30.289
cmh4oyftj006cj5oz1ueqir2c	zh	home.testimonials.title	推荐	2025-10-24 10:11:31.955	2025-10-24 10:11:31.955
cmh4oyh60006dj5ozorga7ivo	zh	home.brands.title	深受领先品牌信赖	2025-10-24 10:11:33.865	2025-10-24 10:11:33.865
cmh4oyil7006ej5ozbq39lfrh	zh	home.brands.subtitle	我们与全球最具标志性的时尚品牌合作	2025-10-24 10:11:35.708	2025-10-24 10:11:35.708
cmh4oyk0f006fj5oz1it9ijoh	zh	home.newsletter.title	保持订阅	2025-10-24 10:11:37.552	2025-10-24 10:11:37.552
cmh4oyl5t006gj5ozov68f7kc	zh	home.newsletter.description	抢先了解新品、专属优惠和时尚小贴士。加入我们的时尚爱好者社区，永远不要错过潮流。	2025-10-24 10:11:39.042	2025-10-24 10:11:39.042
cmh4oymah006hj5ozxfy4ruxm	zh	home.newsletter.placeholder	輸入你的電郵地址	2025-10-24 10:11:40.505	2025-10-24 10:11:40.505
cmh4oynz2006ij5oz06unb7lt	zh	home.newsletter.subscribed	订阅	2025-10-24 10:11:42.686	2025-10-24 10:11:42.686
cmh4oypqj006jj5ozcgb7h5f3	zh	home.newsletter.disclaimer	无垃圾邮件，可随时取消订阅。我们尊重您的隐私。	2025-10-24 10:11:44.971	2025-10-24 10:11:44.971
cmh4oys89006kj5oz5q5iuh50	hi	common.home	मुख पृष्ठ	2025-10-24 10:11:48.202	2025-10-24 10:11:48.202
cmh4oyttr006lj5ozalqvdqae	hi	common.products	उत्पाद	2025-10-24 10:11:50.271	2025-10-24 10:11:50.271
cmh4oyuxp006mj5oz68rrk2xl	hi	common.cart	कार्ट	2025-10-24 10:11:51.709	2025-10-24 10:11:51.709
cmh4oyw3k006nj5oz0cu5q445	hi	common.wishlist	इच्छा सूची	2025-10-24 10:11:53.216	2025-10-24 10:11:53.216
cmh4oyxd4006oj5ozb1jrt4gu	hi	common.search	खोज	2025-10-24 10:11:54.856	2025-10-24 10:11:54.856
cmh4oyyjv006pj5ozw6yw3uij	hi	common.signIn	साइन इन करें	2025-10-24 10:11:56.396	2025-10-24 10:11:56.396
cmh4oz0ba006qj5ozx911mldl	hi	common.signOut	साइन आउट करें	2025-10-24 10:11:58.679	2025-10-24 10:11:58.679
cmh4oz26v006rj5ozf5dfurgs	hi	common.profile	प्रोफ़ाइल	2025-10-24 10:12:01.112	2025-10-24 10:12:01.112
cmh4oz3ji006sj5ozn0h7y7nk	hi	common.admin	ऐडमिन डैशबोर्ड	2025-10-24 10:12:02.64	2025-10-24 10:12:02.64
cmh4oz4t5006tj5oz4dm76p2z	hi	products.loading	लोड कर रहा है...	2025-10-24 10:12:04.505	2025-10-24 10:12:04.505
cmh4oz6gb006uj5ozy87m0edd	hi	products.showingLabel	दिखाना	2025-10-24 10:12:06.635	2025-10-24 10:12:06.635
cmh4oz7o6006vj5ozsuc4agk5	hi	products.of	का	2025-10-24 10:12:08.215	2025-10-24 10:12:08.215
cmh4oz8wg006wj5ozswt2cw0i	hi	products.featured	फ़ीचर्ड	2025-10-24 10:12:09.808	2025-10-24 10:12:09.808
cmh4ozada006xj5ozmu5lf7hq	hi	products.priceLow	कीमत: कम से अधिक	2025-10-24 10:12:11.711	2025-10-24 10:12:11.711
cmh4ozbrp006yj5ozqhna6p06	hi	products.priceHigh	कीमत: अधिक से कम	2025-10-24 10:12:13.525	2025-10-24 10:12:13.525
cmh4ozczx006zj5ozigfrii6w	hi	products.nameAsc	नाम: A → Z	2025-10-24 10:12:15.118	2025-10-24 10:12:15.118
cmh4ozee50070j5ozdc0rj9lw	hi	products.nameDesc	नाम: Z → A	2025-10-24 10:12:16.926	2025-10-24 10:12:16.926
cmh4ozfum0071j5ozzj6ksat2	hi	products.loadMore	और उत्पाद लोड करें	2025-10-24 10:12:18.631	2025-10-24 10:12:18.631
cmh4oziv10072j5ozuyj1pzn3	hi	nav.newArrivals	नए आगमन	2025-10-24 10:12:22.718	2025-10-24 10:12:22.718
cmh4ozkoc0073j5oz2ta44lpo	hi	nav.men	पुरुष	2025-10-24 10:12:25.068	2025-10-24 10:12:25.068
cmh4ozmm00074j5oz8jznl6bz	hi	nav.women	महिला	2025-10-24 10:12:27.577	2025-10-24 10:12:27.577
cmh4ozok90075j5oztry4ob4g	hi	nav.accessories	सहायक उपकरण (एक्सेस्सरीस)	2025-10-24 10:12:30.106	2025-10-24 10:12:30.106
cmh4ozq0e0076j5ozufgnyqyn	hi	nav.sale	सेल	2025-10-24 10:12:31.983	2025-10-24 10:12:31.983
cmh4ozsjh0077j5ozpuwvidlj	hi	footer.about	हमारे बारे में	2025-10-24 10:12:35.104	2025-10-24 10:12:35.104
cmh4ozubu0078j5ozgtg9988u	hi	footer.contact	संपर्क करें	2025-10-24 10:12:37.578	2025-10-24 10:12:37.578
cmh4ozvw60079j5oz87gy72oo	hi	footer.terms	सेवा की शर्तें	2025-10-24 10:12:39.606	2025-10-24 10:12:39.606
cmh4ozwsd007aj5ozlch87y08	hi	footer.privacy	गोपनियता नीति	2025-10-24 10:12:40.765	2025-10-24 10:12:40.765
cmh4ozybm007bj5ozygkzwhnc	hi	footer.copyright	सर्वाधिकार सुरक्षित	2025-10-24 10:12:42.754	2025-10-24 10:12:42.754
cmh4p0005007cj5oz3ngsb5s3	hi	product.addToCart	कार्ट में डालें	2025-10-24 10:12:44.933	2025-10-24 10:12:44.933
cmh4p02gc007dj5ozouubbk93	hi	product.addToWishlist	विशलिस्ट में जोड़ें	2025-10-24 10:12:48.109	2025-10-24 10:12:48.109
cmh4p05ug007ej5ozim8tuxr3	hi	product.outOfStock	'स्टॉक नहीं हैं	2025-10-24 10:12:52.243	2025-10-24 10:12:52.243
cmh4p07fj007fj5ozwxe663bi	hi	product.inStock	स्टॉक में	2025-10-24 10:12:54.559	2025-10-24 10:12:54.559
cmh4p09br007gj5ozb3ab3fzl	hi	product.available	उपलब्ध है	2025-10-24 10:12:57.016	2025-10-24 10:12:57.016
cmh4p0hk8007hj5ozzhchn9nk	hi	product.price	मूल्य	2025-10-24 10:13:07.566	2025-10-24 10:13:07.566
cmh4p0k8a007ij5ozb31yjng1	hi	product.description	विवरण	2025-10-24 10:13:11.146	2025-10-24 10:13:11.146
cmh4p0lkf007jj5ozp8n3lyrc	hi	product.reviews	समीक्षाएँ	2025-10-24 10:13:12.88	2025-10-24 10:13:12.88
cmh4p0n50007kj5oz9niwd7vx	hi	product.noRating	कोई रेटिंग नहीं	2025-10-24 10:13:14.917	2025-10-24 10:13:14.917
cmh4p0q5t007lj5ozjso0vtwq	hi	product.newBadge	नया	2025-10-24 10:13:18.833	2025-10-24 10:13:18.833
cmh4p0slr007mj5ozrc5k1wsw	hi	product.addedToCart	कार्ट में जोड़ा गया	2025-10-24 10:13:22	2025-10-24 10:13:22
cmh4p0unp007nj5oz6j3mzndt	hi	product.signInToSyncCart	अपनी कार्ट को सिंक करने के लिए साइन इन करें	2025-10-24 10:13:24.365	2025-10-24 10:13:24.365
cmh4p0wbg007oj5oz7zpxse2a	hi	product.itemKeptLocally	आइटम को स्थानीय रूप से रखा गया है।	2025-10-24 10:13:26.813	2025-10-24 10:13:26.813
cmh4p0xey007pj5ozu8l6jyyu	hi	product.failedToSyncCart	कार्ट को सिंक नहीं किया जा सका	2025-10-24 10:13:28.235	2025-10-24 10:13:28.235
cmh4p0yrt007qj5oz2tyehqh8	hi	product.wishlistAdded	विशलिस्ट में जोड़ा गया	2025-10-24 10:13:29.994	2025-10-24 10:13:29.994
cmh4p1150007rj5ozsk94911n	hi	product.wishlistRemoved	विशलिस्ट से हटाया गया	2025-10-24 10:13:33.06	2025-10-24 10:13:33.06
cmh4p33w50095j5ozb9hpmnaf	hi	home.newsletter.title	लूप में रहें	2025-10-24 10:15:09.942	2025-10-24 10:15:09.942
cmh4p12l7007sj5ozhkoc88la	hi	product.wishlistActionFailed	विशलिस्ट एक्शन नहीं हो सका	2025-10-24 10:13:34.94	2025-10-24 10:13:34.94
cmh4p13qv007tj5oz3a6fxkul	hi	product.quantity	मात्रा	2025-10-24 10:13:36.439	2025-10-24 10:13:36.439
cmh4p154e007uj5ozv7b7aizb	hi	product.inWishlist	विशलिस्ट में	2025-10-24 10:13:38.223	2025-10-24 10:13:38.223
cmh4p16ia007vj5ozflz67yai	hi	product.wishlist	इच्छा सूची	2025-10-24 10:13:39.736	2025-10-24 10:13:39.736
cmh4p186h007wj5oz32ztp3dy	hi	product.adding	जोड़ना	2025-10-24 10:13:42.185	2025-10-24 10:13:42.185
cmh4p19fp007xj5ozi36rkluk	hi	product.taxIncluded	टैक्स शामिल है। चेक आउट के समय शिपिंग का हिसाब लगाया जाता है।	2025-10-24 10:13:43.813	2025-10-24 10:13:43.813
cmh4p1agj007yj5oz0hpguf9g	hi	product.whyChoose	इस उत्पाद को क्यों चुनें	2025-10-24 10:13:45.139	2025-10-24 10:13:45.139
cmh4p1c50007zj5ozir2vdedv	hi	product.freeShippingOverPrefix	से ज़्यादा के ऑर्डर पर मुफ़्त शिपिंग	2025-10-24 10:13:47.317	2025-10-24 10:13:47.317
cmh4p1d2g0080j5oz9lt1c5da	hi	product.yearWarranty	1 साल की वारंटी शामिल है	2025-10-24 10:13:48.521	2025-10-24 10:13:48.521
cmh4p1ekn0081j5oztsstt5lm	hi	product.returnPolicy30d	30 - दिन की वापसी नीति	2025-10-24 10:13:50.471	2025-10-24 10:13:50.471
cmh4p1gjp0082j5ozhyk9r1b1	hi	product.copiedLink	क्लिपबोर्ड में लिंक कॉपी किया गया	2025-10-24 10:13:53.03	2025-10-24 10:13:53.03
cmh4p1hr20083j5ozpruj1wwp	hi	checkout.title	चेकआउट	2025-10-24 10:13:54.59	2025-10-24 10:13:54.59
cmh4p1jhw0084j5ozdqxdwimu	hi	checkout.deliveryMethod	डिलीवरी का तरीका	2025-10-24 10:13:56.585	2025-10-24 10:13:56.585
cmh4p1kw50085j5ozozql886a	hi	checkout.pickup	randi	2025-10-24 10:13:58.662	2025-10-24 10:13:58.662
cmh4p1mbf0086j5ozyk6wlrx4	hi	checkout.door	दरवाज़े पर डिलीवरी	2025-10-24 10:14:00.507	2025-10-24 10:14:00.507
cmh4p1nz30087j5ozlbs0rarb	hi	checkout.shippingFee	शिपिंग शुल्क	2025-10-24 10:14:02.656	2025-10-24 10:14:02.656
cmh4p1ph80088j5oz7k3npjm5	hi	checkout.gatewayFee	गेटवे शुल्क	2025-10-24 10:14:04.605	2025-10-24 10:14:04.605
cmh4p1r2m0089j5oz6uv4yrqr	hi	checkout.estimatedTotal	अनुमानित कुल	2025-10-24 10:14:06.67	2025-10-24 10:14:06.67
cmh4p1s8j008aj5ozn1ajxxh5	hi	checkout.total	कुल	2025-10-24 10:14:08.18	2025-10-24 10:14:08.18
cmh4p1tqw008bj5oz7hrlroq9	hi	checkout.placeOrder	ऑर्डर दें	2025-10-24 10:14:10.136	2025-10-24 10:14:10.136
cmh4p1vhu008cj5oztzj7p2xu	hi	checkout.pickupAtPoint	हमारे पिक - अप स्थान पर पिक - अप	2025-10-24 10:14:12.189	2025-10-24 10:14:12.189
cmh4p1whl008dj5ozh6r7y36i	hi	checkout.pickupFreeNote	मुफ़्त (डिलीवरी का कोई शुल्क नहीं)	2025-10-24 10:14:13.69	2025-10-24 10:14:13.69
cmh4p1xkh008ej5ozrplt8epn	hi	checkout.doorToDoor	घर - घर - तक डिलीवरी	2025-10-24 10:14:15.089	2025-10-24 10:14:15.089
cmh4p1z2q008fj5oztc8dymht	hi	checkout.doorFeeNote	डिलीवरी शुल्क शहर के हिसाब से लागू होता है	2025-10-24 10:14:17.043	2025-10-24 10:14:17.043
cmh4p21ox008gj5ozthfuxm1k	hi	checkout.pickupCity	पिक - अप शहर	2025-10-24 10:14:20.434	2025-10-24 10:14:20.434
cmh4p22te008hj5ozhdxcnimg	hi	checkout.city	शहर	2025-10-24 10:14:21.891	2025-10-24 10:14:21.891
cmh4p23zt008ij5oz89glsk6a	hi	checkout.selectCity	शहर चुनें	2025-10-24 10:14:23.418	2025-10-24 10:14:23.418
cmh4p25r3008jj5ozx5x0jpw0	hi	checkout.pickupLocation	उठाने की जगह	2025-10-24 10:14:25.695	2025-10-24 10:14:25.695
cmh4p27vu008kj5oznj3en8hi	hi	checkout.selectLocation	स्थान का चयन करें	2025-10-24 10:14:28.29	2025-10-24 10:14:28.29
cmh4p29ml008lj5ozaybkt5k2	hi	home.hero.slide1.title	अपनी शैली को ऊपर उठाएँ	2025-10-24 10:14:30.717	2025-10-24 10:14:30.717
cmh4p2aw9008mj5ozxismkbmz	hi	home.hero.slide1.text	प्रीमियम फ़ैशन की खोज करें जो आपके अनोखे व्यक्तित्व को परिभाषित करता है	2025-10-24 10:14:32.361	2025-10-24 10:14:32.361
cmh4p2cs8008nj5oz24oxolrt	hi	home.hero.slide1.cta	संग्रह का जायज़ा लें	2025-10-24 10:14:34.809	2025-10-24 10:14:34.809
cmh4p2dwh008oj5ozj8itk25q	hi	home.hero.slide2.title	अभी ट्रेंड कर रहे हैं	2025-10-24 10:14:36.257	2025-10-24 10:14:36.257
cmh4p2fb6008pj5oz470eyr8i	hi	home.hero.slide2.text	नवीनतम फैशन के रुझानों और विशेष टुकड़ों के साथ आगे रहें	2025-10-24 10:14:38.082	2025-10-24 10:14:38.082
cmh4p2gge008qj5oz1gi2510r	hi	home.hero.slide2.cta	खरीदारी के रुझान	2025-10-24 10:14:39.567	2025-10-24 10:14:39.567
cmh4p2hb0008rj5ozsmuiauml	hi	home.hero.slide3.title	नए आगमन	2025-10-24 10:14:40.669	2025-10-24 10:14:40.669
cmh4p2iyn008sj5ozlz1zxvgd	hi	home.hero.slide3.text	नई शैलियाँ अभी - अभी उतरी हैं - उन्हें पहनने वाले पहले व्यक्ति बनें	2025-10-24 10:14:42.815	2025-10-24 10:14:42.815
cmh4p2l2v008tj5ozav0jttto	hi	home.hero.slide3.cta	देखें कि नया क्या है	2025-10-24 10:14:45.411	2025-10-24 10:14:45.411
cmh4p2mlj008uj5oz8n8sf2gd	hi	home.categories.tagline	जायज़ा लें	2025-10-24 10:14:47.527	2025-10-24 10:14:47.527
cmh4p2o0n008vj5oz430kzc7y	hi	home.categories.title	श्रेणियाँ	2025-10-24 10:14:49.367	2025-10-24 10:14:49.367
cmh4p2pr8008wj5ozss0pkml3	hi	home.categories.error	कैटेगरी लोड नहीं की जा सकी।	2025-10-24 10:14:51.62	2025-10-24 10:14:51.62
cmh4p2r0m008xj5ozdv4q7cgo	hi	home.featured.tagline	हमारी खोज करें	2025-10-24 10:14:53.254	2025-10-24 10:14:53.254
cmh4p2stx008yj5ozwt8yk93a	hi	home.featured.title	चुनिंदा उत्पाद	2025-10-24 10:14:55.606	2025-10-24 10:14:55.606
cmh4p2u5y008zj5oz0ygxgueh	hi	home.featured.description	हस्तनिर्मित आइटम जो फैशन, गुणवत्ता और शैली का सबसे अच्छा प्रतिनिधित्व करते हैं। आपके लिए नवीनतम रुझानों और कालातीत क्लासिक्स लाने के लिए प्रत्येक टुकड़े को सावधानीपूर्वक चुना जाता है।	2025-10-24 10:14:57.334	2025-10-24 10:14:57.334
cmh4p2vit0090j5ozxe4dwsv9	hi	home.featured.viewAll	सभी उत्पाद देखें	2025-10-24 10:14:59.093	2025-10-24 10:14:59.093
cmh4p2xqq0091j5ozg0trqu33	hi	home.testimonials.tagline	हमारे ग्राहक क्या कहते हैं	2025-10-24 10:15:01.726	2025-10-24 10:15:01.726
cmh4p2zai0092j5oz9k6e74uv	hi	home.testimonials.title	टेस्टिमोनिअल्स	2025-10-24 10:15:03.978	2025-10-24 10:15:03.978
cmh4p30wg0093j5ozkg9anu1h	hi	home.brands.title	लीडिंग ब्रांड्स द्वारा भरोसेमंद	2025-10-24 10:15:06.064	2025-10-24 10:15:06.064
cmh4p32jh0094j5ozjai2szjj	hi	home.brands.subtitle	हम दुनिया के सबसे मशहूर फ़ैशन ब्रांडों के साथ पार्टनरशिप करते हैं	2025-10-24 10:15:08.19	2025-10-24 10:15:08.19
cmh4p35tw0096j5oz4vn83lnm	hi	home.newsletter.description	नए आगमन, विशेष डील और फ़ैशन सुझावों के बारे में जानने वाले पहले व्यक्ति बनें। स्टाइल के शौकीनों के हमारे समुदाय में शामिल हों और कभी भी किसी ट्रेंड से न चूकें।	2025-10-24 10:15:12.452	2025-10-24 10:15:12.452
cmh4p388q0097j5oz2qyi90fb	hi	home.newsletter.placeholder	अपना ईमेल पता डालें।	2025-10-24 10:15:15.578	2025-10-24 10:15:15.578
cmh4p3a830098j5oz4ksk92q0	hi	home.newsletter.subscribe	सदस्यता लें	2025-10-24 10:15:18.147	2025-10-24 10:15:18.147
cmh4p3c020099j5oz3ngh135j	hi	home.newsletter.subscribed	सदस्यता ली गई	2025-10-24 10:15:20.45	2025-10-24 10:15:20.45
cmh4p3cxv009aj5ozvwwi2hoo	hi	home.newsletter.disclaimer	कोई स्पैम नहीं, किसी भी समय सदस्यता समाप्त करें। हम आपकी निजता का सम्मान करते हैं।	2025-10-24 10:15:21.667	2025-10-24 10:15:21.667
cmh4p3ga1009bj5oz19vojg5d	ar	common.home	المنزل	2025-10-24 10:15:25.993	2025-10-24 10:15:25.993
cmh4p3i11009cj5ozc5e05ewc	ar	common.products	المنتجات	2025-10-24 10:15:28.261	2025-10-24 10:15:28.261
cmh4p3jb2009dj5ozfsptka87	ar	common.cart	سلة التسوق	2025-10-24 10:15:29.801	2025-10-24 10:15:29.801
cmh4p3kkd009ej5ozdh49n5k6	ar	common.wishlist	قائمة الأمنيات	2025-10-24 10:15:31.549	2025-10-24 10:15:31.549
cmh4p3lw0009fj5ozgz1kt2w1	ar	common.search	--	2025-10-24 10:15:33.264	2025-10-24 10:15:33.264
cmh4p3nij009gj5ozd1kvfdd4	ar	common.signIn	تسجيل الدخول	2025-10-24 10:15:35.372	2025-10-24 10:15:35.372
cmh4p3oto009hj5ozfrpq1nof	ar	common.signOut	تسجيل الخروج	2025-10-24 10:15:37.068	2025-10-24 10:15:37.068
cmh4p3q35009ij5oz7l547xgw	ar	common.profile	الملف	2025-10-24 10:15:38.705	2025-10-24 10:15:38.705
cmh4p3rzr009jj5ozerbnxsed	ar	common.admin	لوحة معلومات المسؤول	2025-10-24 10:15:41.175	2025-10-24 10:15:41.175
cmh4p3t53009kj5oz939p2pcw	ar	products.loading	جاري التحميل...	2025-10-24 10:15:42.663	2025-10-24 10:15:42.663
cmh4p3ul7009lj5ozs0l9zkp3	ar	products.showingLabel	عرض	2025-10-24 10:15:44.539	2025-10-24 10:15:44.539
cmh4p3wjw009mj5ozzg23zp6n	ar	products.of	لــ	2025-10-24 10:15:46.948	2025-10-24 10:15:46.948
cmh4p3xvf009nj5oztq3z6tia	ar	products.featured	مميز	2025-10-24 10:15:48.795	2025-10-24 10:15:48.795
cmh4p3z7c009oj5oz4c8zelwm	ar	products.priceLow	السعر من الارخص الى الأغلى	2025-10-24 10:15:50.521	2025-10-24 10:15:50.521
cmh4p40a2009pj5ozx82bhr20	ar	products.priceHigh	السعر : من الأغلى إلى الأرخص	2025-10-24 10:15:51.914	2025-10-24 10:15:51.914
cmh4p41jo009qj5ozfzabljac	ar	products.nameAsc	الاسم: من الياء إلى الألف	2025-10-24 10:15:53.556	2025-10-24 10:15:53.556
cmh4p42tk009rj5oze4g6meoz	ar	products.nameDesc	الاسم: من الياء إلى الألف	2025-10-24 10:15:55.208	2025-10-24 10:15:55.208
cmh4p43nx009sj5ozl0gbobdw	ar	products.loadMore	عرض المزيد من المنتجات	2025-10-24 10:15:56.302	2025-10-24 10:15:56.302
cmh4p44xw009tj5ozxvqb883a	ar	nav.newArrivals	المنتجات الجديدة	2025-10-24 10:15:57.957	2025-10-24 10:15:57.957
cmh4p45zv009uj5ozi9yezcqw	ar	nav.men	الرجال	2025-10-24 10:15:59.323	2025-10-24 10:15:59.323
cmh4p47df009vj5oz7wp0a4c4	ar	nav.women	النساء	2025-10-24 10:16:01.107	2025-10-24 10:16:01.107
cmh4p48s3009wj5oz6lxsp8wv	ar	nav.accessories	الملحقات	2025-10-24 10:16:02.814	2025-10-24 10:16:02.814
cmh4p49t6009xj5ozhsmekxpp	ar	nav.sale	تصميم آمن	2025-10-24 10:16:04.267	2025-10-24 10:16:04.267
cmh4p4bkd009yj5oz2kzrh9wj	ar	footer.about	نبذة عنّا	2025-10-24 10:16:06.542	2025-10-24 10:16:06.542
cmh4p4crg009zj5ozhasgnqe1	ar	footer.contact	الاتصال	2025-10-24 10:16:08.092	2025-10-24 10:16:08.092
cmh4p4e6d00a0j5ozkofkr3ln	ar	footer.terms	شروط الخدمة	2025-10-24 10:16:09.925	2025-10-24 10:16:09.925
cmh4p4fh400a1j5ozv4kub2p4	ar	footer.privacy	سياسة الخصوصية	2025-10-24 10:16:11.608	2025-10-24 10:16:11.608
cmh4p4glh00a2j5oz594taduc	ar	footer.copyright	جميع الحقوق محفوظة	2025-10-24 10:16:13.061	2025-10-24 10:16:13.061
cmh4p4hyv00a3j5ozofpd9f2e	ar	product.addToCart	اضف للسلة	2025-10-24 10:16:14.839	2025-10-24 10:16:14.839
cmh4p4itt00a4j5oz43fyv2ov	ar	product.addToWishlist	إضافة إلى قائمة الأمنيات	2025-10-24 10:16:15.953	2025-10-24 10:16:15.953
cmh4p4k1d00a5j5oz38s2ksn3	ar	product.outOfStock	غير متوفر	2025-10-24 10:16:17.522	2025-10-24 10:16:17.522
cmh4p4m3b00a6j5ozkoge0oys	ar	product.inStock	متوفر	2025-10-24 10:16:19.979	2025-10-24 10:16:19.979
cmh4p4njp00a7j5ozx42vy8h0	ar	product.available	متوفر	2025-10-24 10:16:22.07	2025-10-24 10:16:22.07
cmh4p4ol800a8j5oz8gxqh8nb	ar	product.price	الأسعار	2025-10-24 10:16:23.42	2025-10-24 10:16:23.42
cmh4p4q5400a9j5oz2yvdhyuf	ar	product.description	الوصف	2025-10-24 10:16:25.433	2025-10-24 10:16:25.433
cmh4p4r4g00aaj5ozpefoekj0	ar	product.reviews	مراجعات	2025-10-24 10:16:26.704	2025-10-24 10:16:26.704
cmh4p4sqe00abj5ozbg1jqtri	ar	product.noRating	لا يوجد تقييم	2025-10-24 10:16:28.791	2025-10-24 10:16:28.791
cmh4p4ub300acj5oz72x2lfw1	ar	product.newBadge	منتج جديد	2025-10-24 10:16:30.832	2025-10-24 10:16:30.832
cmh4p4vii00adj5oz1n72cbn0	ar	product.addedToCart	تم الإضافة الى السلة	2025-10-24 10:16:32.394	2025-10-24 10:16:32.394
cmh4p4wu100aej5ozzkph71cb	ar	product.signInToSyncCart	سجّل الدخول لمزامنة سلة التسوق	2025-10-24 10:16:34.105	2025-10-24 10:16:34.105
cmh4p4yd900afj5ozcdbk0j1g	ar	product.itemKeptLocally	يتم الاحتفاظ بالعنصر محليًا.	2025-10-24 10:16:36.094	2025-10-24 10:16:36.094
cmh4p4zod00agj5ozgsyzguey	ar	product.failedToSyncCart	تعذر مزامنة سلة التسوق	2025-10-24 10:16:37.789	2025-10-24 10:16:37.789
cmh4p51yy00ahj5ozlywl6qvq	ar	product.wishlistRemoved	حُذفت من قائمة إهتماماتى	2025-10-24 10:16:40.762	2025-10-24 10:16:40.762
cmh4p539100aij5ozjalks26e	ar	product.wishlistActionFailed	فشل إجراء قائمة الرغبات	2025-10-24 10:16:42.422	2025-10-24 10:16:42.422
cmh4p54tb00ajj5ozbtrp8cbf	ar	product.quantity	العدد	2025-10-24 10:16:44.447	2025-10-24 10:16:44.447
cmh4p564h00akj5ozy1my4umi	ar	product.inWishlist	في قائمة الرغبات	2025-10-24 10:16:46.145	2025-10-24 10:16:46.145
cmh4p579m00alj5ozc70p1g4p	ar	product.wishlist	قائمة الأمنيات	2025-10-24 10:16:47.626	2025-10-24 10:16:47.626
cmh4p58lv00amj5ozdj6u1m9v	ar	product.adding	قيد الإضافه...	2025-10-24 10:16:49.363	2025-10-24 10:16:49.363
cmh4p59tj00anj5ozws50r5si	ar	product.taxIncluded	شامل الضريبة. <a href="{{ link }}" target="_blank">الشحن</a> يتم حسابها في صفحة الدفع.	2025-10-24 10:16:50.823	2025-10-24 10:16:50.823
cmh4p5bdi00aoj5ozpk2fimw5	ar	product.whyChoose	لماذا تختار هذا المنتج	2025-10-24 10:16:52.95	2025-10-24 10:16:52.95
cmh4p5dh100apj5oz2jn6tbqt	ar	product.freeShippingOverPrefix	شحن مجاني للطلبات أكثر من 50$	2025-10-24 10:16:55.669	2025-10-24 10:16:55.669
cmh4p5f1i00aqj5oz1vozdssm	ar	product.yearWarranty	ضمان لمدة سنة واحدة مشمول	2025-10-24 10:16:57.703	2025-10-24 10:16:57.703
cmh4p5g9r00arj5ozryn3amk4	ar	product.returnPolicy30d	سياسة الإرجاع في خلال 30 يوم	2025-10-24 10:16:59.296	2025-10-24 10:16:59.296
cmh4p5hsk00asj5ozmu5d1e4n	ar	product.copiedLink	تم نسخ الرابط إلى الحافظة	2025-10-24 10:17:01.269	2025-10-24 10:17:01.269
cmh4p5iu800atj5ozc8aor2th	ar	checkout.title	الرسوم	2025-10-24 10:17:02.624	2025-10-24 10:17:02.624
cmh4p5kat00auj5oz38cl55xo	ar	checkout.deliveryMethod	طريقة تقديم الدورة	2025-10-24 10:17:04.518	2025-10-24 10:17:04.518
cmh4p5lkt00avj5ozd8k1benh	ar	checkout.pickup	سيارة ذات صندوق خلفي (بيك أب)	2025-10-24 10:17:06.051	2025-10-24 10:17:06.051
cmh4p5n0600awj5ozputjc752	ar	checkout.door	توصيل عبر الباب	2025-10-24 10:17:08.023	2025-10-24 10:17:08.023
cmh4p5ofc00axj5ozc81abets	ar	checkout.shippingFee	رسوم الشحن	2025-10-24 10:17:09.865	2025-10-24 10:17:09.865
cmh4p5qbs00ayj5ozg80n52xy	ar	checkout.gatewayFee	رسوم البوابة	2025-10-24 10:17:12.328	2025-10-24 10:17:12.328
cmh4p5rd600azj5ozp1xy3a3x	ar	checkout.estimatedTotal	الإجمالي التقديري	2025-10-24 10:17:13.675	2025-10-24 10:17:13.675
cmh4p5t0500b0j5oz76gan95h	ar	checkout.total	الإجمالي	2025-10-24 10:17:15.797	2025-10-24 10:17:15.797
cmh4p5ui600b1j5oz5z10pxj8	ar	checkout.placeOrder	تقديم الطلب	2025-10-24 10:17:17.742	2025-10-24 10:17:17.742
cmh4p5vdr00b2j5ozb47q09o1	ar	checkout.pickupAtPoint	الالتقاء بالشريك السائق في نقطة الالتقاء	2025-10-24 10:17:18.879	2025-10-24 10:17:18.879
cmh4p5wsi00b3j5ozzcyomz92	ar	checkout.pickupFreeNote	مجاناً (بدون رسوم توصيل)	2025-10-24 10:17:20.707	2025-10-24 10:17:20.707
cmh4p5y4h00b4j5ozs2i4i95r	ar	checkout.doorToDoor	التوصيل من الباب إلى الباب	2025-10-24 10:17:22.242	2025-10-24 10:17:22.242
cmh4p5zn600b5j5oz1tz4a318	ar	checkout.doorFeeNote	يتم تطبيق رسوم التوصيل حسب المدينة	2025-10-24 10:17:24.403	2025-10-24 10:17:24.403
cmh4p60nv00b6j5ozx8sx44z6	ar	checkout.pickupCity	مدينة الالتقاء	2025-10-24 10:17:25.723	2025-10-24 10:17:25.723
cmh4p61m700b7j5ozly7pd9qt	ar	checkout.city	City	2025-10-24 10:17:26.959	2025-10-24 10:17:26.959
cmh4p62s300b8j5ozbyc4ss2k	ar	checkout.selectCity	اختر مدينة	2025-10-24 10:17:28.467	2025-10-24 10:17:28.467
cmh4p644q00b9j5ozkfaewp01	ar	checkout.pickupLocation	موقع الاستلام	2025-10-24 10:17:30.218	2025-10-24 10:17:30.218
cmh4p65u300baj5oz66tr60wj	ar	checkout.selectLocation	اختر المكان	2025-10-24 10:17:32.427	2025-10-24 10:17:32.427
cmh4p672o00bbj5ozp9dynujg	ar	home.hero.slide1.title	ارتقِ بأسلوبك ... اترك بصمتك	2025-10-24 10:17:34.033	2025-10-24 10:17:34.033
cmh4p681y00bcj5ozupf28u8u	ar	home.hero.slide1.text	اكتشف الموضة المتميزة التي تحدد شخصيتك الفريدة	2025-10-24 10:17:35.303	2025-10-24 10:17:35.303
cmh4p69o200bdj5oz2dxlkc5y	ar	home.hero.slide1.cta	استكشف المجموعة	2025-10-24 10:17:37.394	2025-10-24 10:17:37.394
cmh4p6bok00bej5ozul4c8ym9	ar	home.hero.slide2.title	التريند الشائع الآن	2025-10-24 10:17:40.004	2025-10-24 10:17:40.004
cmh4p6cxf00bfj5ozv7hnaw2a	ar	home.hero.slide2.text	ابقوا على اطلاع بأحدث صيحات الموضة والقطع الحصرية	2025-10-24 10:17:41.619	2025-10-24 10:17:41.619
cmh4p6ei700bgj5ozp1ffm9bg	ar	home.hero.slide2.cta	اتجاهات التسوق	2025-10-24 10:17:43.663	2025-10-24 10:17:43.663
cmh4p6fuu00bhj5oz44kz4abz	ar	home.hero.slide3.title	المنتجات الجديدة	2025-10-24 10:17:45.415	2025-10-24 10:17:45.415
cmh4p6hbv00bij5oz2f88kled	ar	home.hero.slide3.text	تصميمات جديدة هبطت للتو - كن أول من يرتديها	2025-10-24 10:17:47.323	2025-10-24 10:17:47.323
cmh4p6ix600bjj5oz983873wc	ar	home.hero.slide3.cta	شاهد ما الجديد	2025-10-24 10:17:49.386	2025-10-24 10:17:49.386
cmh4p6k6t00bkj5ozev0m8rms	ar	home.categories.tagline	استكشاف	2025-10-24 10:17:51.03	2025-10-24 10:17:51.03
cmh4p6l9y00blj5ozpuk0diuo	ar	home.categories.title	فئات الجائزة	2025-10-24 10:17:52.438	2025-10-24 10:17:52.438
cmh4p6mxw00bmj5ozpbr1v8qm	ar	home.categories.error	تعذر تحميل الفئات.	2025-10-24 10:17:54.286	2025-10-24 10:17:54.286
cmh4p6oft00bnj5ozrbnjetkf	ar	home.featured.tagline	استكشف	2025-10-24 10:17:56.538	2025-10-24 10:17:56.538
cmh4p6pmi00boj5ozrvf2tl7q	ar	home.featured.title	منتجات مميزة	2025-10-24 10:17:58.074	2025-10-24 10:17:58.074
cmh4p6qyy00bpj5ozna7q3sej	ar	home.featured.description	العناصر المختارة بعناية والتي تمثل أفضل ما في الموضة والجودة والأناقة. يتم اختيار كل قطعة بعناية لتجلب لك أحدث الاتجاهات والكلاسيكيات الخالدة.	2025-10-24 10:17:59.819	2025-10-24 10:17:59.819
cmh4p6sb700bqj5ozxzkb5b8v	ar	home.featured.viewAll	عرض جميع المنتجات	2025-10-24 10:18:01.555	2025-10-24 10:18:01.555
cmh4p6tr600brj5oz9u4fsmma	ar	home.testimonials.tagline	رأي عملائنا	2025-10-24 10:18:03.426	2025-10-24 10:18:03.426
cmh4p6v6y00bsj5ozguwnp786	ar	home.testimonials.title	شهادات العملاء	2025-10-24 10:18:05.291	2025-10-24 10:18:05.291
cmh4p6wr600btj5oz6kgr55vp	ar	home.brands.title	موثوق به من قبل العلامات التجارية الرائدة	2025-10-24 10:18:07.314	2025-10-24 10:18:07.314
cmh4p6y5400buj5ozrgi5bqek	ar	home.brands.subtitle	نتشارك مع أشهر العلامات التجارية للأزياء في العالم	2025-10-24 10:18:09.112	2025-10-24 10:18:09.112
cmh4p70d900bvj5ozx2bgvd8s	ar	home.newsletter.title	ابق على اطلاع	2025-10-24 10:18:11.846	2025-10-24 10:18:11.846
cmh4p71wa00bwj5oz75gxdhjl	ar	home.newsletter.description	كن أول من يعرف عن القادمين الجدد، والعروض الحصرية، ونصائح الموضة. انضم إلى مجتمعنا من عشاق الأناقة ولا تفوت أبدًا أي اتجاه.	2025-10-24 10:18:13.978	2025-10-24 10:18:13.978
cmh4p72xh00bxj5ozst3aeqhs	ar	home.newsletter.placeholder	أدخل عنوان البريد الإلكتروني	2025-10-24 10:18:15.317	2025-10-24 10:18:15.317
cmh4p74c500byj5ozvmj5mo2j	ar	home.newsletter.subscribe	اشتراك	2025-10-24 10:18:17.141	2025-10-24 10:18:17.141
cmh4p757g00bzj5oz2x3sxcjt	ar	home.newsletter.subscribed	‫مشترك‬	2025-10-24 10:18:18.269	2025-10-24 10:18:18.269
cmh4p76xh00c0j5ozl0uyb4qc	ar	home.newsletter.disclaimer	لا توجد رسائل غير مرغوب فيها، قم بإلغاء الاشتراك في أي وقت. نحن نحترم خصوصيتك.	2025-10-24 10:18:20.502	2025-10-24 10:18:20.502
cmh4pkj4s00c1j5ozevl4kl3r	fr	home.testimonials.items.0.name	Sarah Johnson	2025-10-24 10:28:42.844	2025-10-24 10:28:42.844
cmh4pkku300c2j5ozqty8wbu9	fr	home.testimonials.items.0.role	Blog de mode	2025-10-24 10:28:45.052	2025-10-24 10:28:45.052
cmh4pkm3i00c3j5ozqy2u2tsx	fr	home.testimonials.items.0.content	Trendify a complètement transformé ma garde-robe ! La qualité est exceptionnelle et les styles sont toujours au rendez-vous. Je reçois des compliments chaque fois que je porte leurs pièces.	2025-10-24 10:28:46.686	2025-10-24 10:28:46.686
cmh4pknun00c4j5ozx82ea265	fr	home.testimonials.items.1.name	Michael Chen	2025-10-24 10:28:48.959	2025-10-24 10:28:48.959
cmh4pkp2z00c5j5oz3ryu9cl4	fr	home.testimonials.items.1.role	directeur artistique	2025-10-24 10:28:50.555	2025-10-24 10:28:50.555
cmh4pkqk500c6j5oz1qsie5q5	fr	home.testimonials.items.1.content	En tant que personne qui valorise à la fois le style et le confort, Trendify tient ses promesses sur les deux fronts. Leur service à la clientèle est exceptionnel et l'expédition est incroyablement rapide.	2025-10-24 10:28:52.469	2025-10-24 10:28:52.469
cmh4pkry300c7j5oziu0j1fz8	fr	home.testimonials.items.2.name	Emma Rodriguez	2025-10-24 10:28:54.267	2025-10-24 10:28:54.267
cmh4pkszv00c8j5ozb1uv2rla	fr	home.testimonials.items.2.role	Un influenceur lifestyle	2025-10-24 10:28:55.628	2025-10-24 10:28:55.628
cmh4pkuvi00c9j5ozo7spjwok	fr	home.testimonials.items.2.content	Je fais du shopping avec Trendify depuis plus d'un an maintenant, et ils ne déçoivent jamais. La variété est incroyable et les prix sont très raisonnables pour la qualité que vous obtenez.	2025-10-24 10:28:58.063	2025-10-24 10:28:58.063
cmh4plext00caj5ozocwrhxr3	es	home.testimonials.items.0.name	Sarah Johnson	2025-10-24 10:29:24.065	2025-10-24 10:29:24.065
cmh4plgtp00cbj5ozk0jfn6dz	es	home.testimonials.items.0.role	Blogger de moda	2025-10-24 10:29:26.509	2025-10-24 10:29:26.509
cmh4plhvm00ccj5ozieg9ez0j	es	home.testimonials.items.0.content	¡Trendify ha transformado por completo mi vestuario! La calidad es excepcional y los estilos siempre acertados. Recibo elogios cada vez que uso sus prendas.	2025-10-24 10:29:27.874	2025-10-24 10:29:27.874
cmh4plj2c00cdj5ozigvlq7ip	es	home.testimonials.items.1.name	Michael Chen	2025-10-24 10:29:29.413	2025-10-24 10:29:29.413
cmh4plkky00cej5oz02a6s8tw	es	home.testimonials.items.1.role	Director creativo	2025-10-24 10:29:31.255	2025-10-24 10:29:31.255
cmh4pllwv00cfj5ozt6kmop2p	es	home.testimonials.items.1.content	Como alguien que valora tanto el estilo como la comodidad, Trendify cumple en ambos frentes. Su servicio al cliente es excepcional y el envío es increíblemente rápido.	2025-10-24 10:29:32.98	2025-10-24 10:29:32.98
cmh4pln6800cgj5ozb38z6ri3	es	home.testimonials.items.2.name	Emma Rodriguez	2025-10-24 10:29:34.736	2025-10-24 10:29:34.736
cmh4plo9w00chj5oz82jzl30a	es	home.testimonials.items.2.role	Influenciador del estilo de vida	2025-10-24 10:29:36.165	2025-10-24 10:29:36.165
cmh4plpu800cij5oz09twk0gp	es	home.testimonials.items.2.content	He estado comprando con Trendify durante más de un año y nunca decepcionan. La variedad es increíble y los precios son muy razonables para la calidad que obtienes.	2025-10-24 10:29:38.192	2025-10-24 10:29:38.192
cmh4pmh0v00cjj5ozfl49hi8a	zh	home.testimonials.items.0.name	Sarah Johnson	2025-10-24 10:30:13.22	2025-10-24 10:30:13.22
cmh4pmizw00ckj5ozredo46kp	zh	home.testimonials.items.0.role	时尚博主	2025-10-24 10:30:15.98	2025-10-24 10:30:15.98
cmh4pmki800clj5oz5dhyzpmz	zh	home.testimonials.items.0.content	Trendify彻底改变了我的衣橱！品质卓越，款式始终与时俱进。每次穿他们的衣服，我都会得到赞美。	2025-10-24 10:30:17.937	2025-10-24 10:30:17.937
cmh4pml8y00cmj5ozdj7q8ckj	zh	home.testimonials.items.1.name	Michael Chen	2025-10-24 10:30:18.898	2025-10-24 10:30:18.898
cmh4pmmxz00cnj5ozpw3qx7ww	zh	home.testimonials.items.1.role	创意总监	2025-10-24 10:30:21.096	2025-10-24 10:30:21.096
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.users (id, name, email, role, created_at, updated_at, "isActive", deleted_at, avatar, clerk_id, is_verified, last_login_at) FROM stdin;
user_31lquR7NEj0nv7HLtmbIjVu4nHh	Jhay	jhaycodes999@gmail.com	customer	2025-08-25 08:07:29.281	2025-08-25 08:09:12.475	t	\N	https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18ydXdKRzVTOTRvUkFoS0NFaE5kNElId3FMc3kiLCJyaWQiOiJ1c2VyXzMxbHF1UjdORWowbnY3SEx0bWJJalZ1NG5IaCJ9	\N	t	2025-08-25 08:07:29.28
user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	Admin Developer	testpjmail@gmail.com	admin	2025-08-18 21:37:41.622	2025-08-18 21:37:41.622	t	\N	\N	\N	f	\N
cmehmyrxo0000i9kgmqs45ovs	Sarah Staff	staff@example.com	staff	2025-08-18 21:37:41.868	2025-08-18 21:37:41.868	t	\N	\N	\N	f	\N
cmehmys0w0001i9kgemb7pnli	Francis Johnson	francis@example.com	customer	2025-08-18 21:37:41.984	2025-08-18 21:37:41.984	t	\N	\N	\N	f	\N
cmehmyskj0002i9kgkl0mquew	David Chen	david@example.com	customer	2025-08-18 21:37:41.984	2025-08-18 21:37:41.984	t	\N	\N	\N	f	\N
cmehmyskt0003i9kguik3xua5	Maria Garcia	maria@example.com	customer	2025-08-18 21:37:41.984	2025-08-18 21:37:41.984	t	\N	\N	\N	f	\N
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.wishlist_items (id, wishlist_id, product_id, added_at) FROM stdin;
cmehmyw2g003xi9kge6xdwswh	cmehmyw2g003vi9kg913rls0d	cmehmytvo000pi9kgcuq1x6z0	2025-08-18 21:37:47.224
cmehmyw2g003yi9kgli9rxyp9	cmehmyw2g003vi9kg913rls0d	cmehmyufd0015i9kg4t8rvemm	2025-08-18 21:37:47.224
cmezzhvpm0001l804pym39l7j	cmequ6uw10001l404imtxxq3g	cmehmyufd0015i9kg4t8rvemm	2025-08-31 17:48:19.783
cmezzhx6e0003l804cwwld2py	cmequ6uw10001l404imtxxq3g	cmehmyuew000ti9kgooiqhhuq	2025-08-31 17:48:21.686
cmh252hlv000sj57271dvfhi0	cmeixn653000bi944323xro3g	cmehmyuf8000zi9kgsu5rm18f	2025-10-22 15:19:16.387
cmh4voswx0003j5zp7yh7hlkf	cmeixn653000bi944323xro3g	cmehmytvo000qi9kg5ygnzimm	2025-10-24 13:19:59.841
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.wishlists (id, user_id, deleted_at) FROM stdin;
cmehmyw2g003vi9kg913rls0d	cmehmys0w0001i9kgemb7pnli	\N
cmeixn653000bi944323xro3g	user_2v2E35dLiYgfHGjB4pkWvbIe5Yo	\N
cmequ6uw10001l404imtxxq3g	user_31lquR7NEj0nv7HLtmbIjVu4nHh	\N
\.

SET session_replication_role = DEFAULT;
COMMIT;
