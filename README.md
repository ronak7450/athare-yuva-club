# सरस्वती पूजा हिसाब ट्रैकिंग सिस्टम

यह एप्लिकेशन सरस्वती पूजा के दौरान आय और खर्च का हिसाब रखने के लिए बनाया गया है।

## सिस्टम आवश्यकताएं

- XAMPP (Apache + MySQL)
- PHP 7.4 या उससे ऊपर
- वेब ब्राउज़र (Chrome, Firefox, आदि)

## इंस्टॉलेशन

1. XAMPP इंस्टॉल करें
2. htdocs फोल्डर में सभी फाइल्स कॉपी करें
3. Apache और MySQL सर्विस स्टार्ट करें
4. ब्राउज़र में http://localhost/login.html खोलें

## डिफ़ॉल्ट लॉगिन क्रेडेंशियल्स

- यूजरनेम: admin
- पासवर्ड: admin123

## फीचर्स

1. **डैशबोर्ड**
   - कुल आय और खर्च का रीयल-टाइम व्यू
   - आय और खर्च जोड़ने के क्विक बटन
   - विजुअल चार्ट्स

2. **लेन-देन**
   - सभी लेन-देन की लिस्ट
   - फिल्टर और सर्च
   - आय/खर्च के अनुसार छँटाई

3. **रिपोर्ट्स**
   - कस्टम डेट रेंज सेलेक्शन
   - विस्तृत आँकड़े और चार्ट्स
   - PDF डाउनलोड

## सुरक्षा फीचर्स

- यूजर ऑथेंटिकेशन
- पासवर्ड एनक्रिप्शन
- SQL इंजेक्शन प्रोटेक्शन

## फाइल स्ट्रक्चर

```
htdocs/
├── api/
│   ├── auth.php
│   ├── transactions.php
│   └── reports.php
├── config/
│   └── db.php
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   ├── transactions.js
│   └── reports.js
├── index.html
├── login.html
├── transactions.html
└── reports.html
```

## डेटाबेस स्कीमा

### users
- id (INT, AUTO_INCREMENT)
- username (VARCHAR)
- password (VARCHAR)
- created_at (TIMESTAMP)

### income
- id (INT, AUTO_INCREMENT)
- name (VARCHAR)
- amount (DECIMAL)
- date (DATE)
- note (TEXT)
- created_at (TIMESTAMP)

### expense
- id (INT, AUTO_INCREMENT)
- title (VARCHAR)
- amount (DECIMAL)
- date (DATE)
- note (TEXT)
- created_at (TIMESTAMP)

## एरर हैंडलिंग

- सभी API कॉल्स में एरर हैंडलिंग
- यूजर-फ्रेंडली एरर मैसेज
- लॉगिंग फॉर डीबगिंग

## मेंटेनेंस

1. रेगुलर बैकअप लें
2. लॉग्स चेक करें
3. पासवर्ड नियमित रूप से बदलें

## सपोर्ट

किसी भी समस्या के लिए सिस्टम एडमिन से संपर्क करें।
