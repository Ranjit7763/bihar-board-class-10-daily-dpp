
# Bihar Board Class 10 Daily DPP Quiz App

Hello Students! Yeh app khas Bihar Board Class 10 ke students ke liye banaya gaya hai. 
Niche iska technical structure samjhaya gaya hai:

### 1. Project Architecture (Android Strategy)
Android app ke liye hum **MVVM (Model-View-ViewModel)** architecture use karenge.
- **View:** XML Layouts (Activities/Fragments)
- **ViewModel:** Quiz logic manage karega and Firebase se connect karega.
- **Repository:** Offline caching (Room DB) aur Firebase sync handle karega.

### 2. Firebase Database Structure
Firebase Firestore use karke data store hoga:
- `users`: `{uid, name, email, streak, xp, level}`
- `questions`: `{id, text, options, correct_idx, subject, chapter, explanation}`
- `quizzes`: `{id, date, subject, title, is_dpp}`
- `leaderboard`: `{uid, total_score, rank}`

### 3. AI Question Generation (Prompts)
Admin panel me hum Gemini API integration use kar rahe hain:
**Prompt Example:**
> "Generate 10 MCQ questions for BSEB Class 10 Mathematics. Chapter: Real Numbers. Difficulty: Medium. Format: JSON. Language: Hinglish."

### 4. Monetization Ideas
- **Ads:** Google AdMob integration (Banner ads in Home, Interstitial ads after quiz completion).
- **Premium:** Ads-free experience + PDF Notes download + Exclusive Mock Tests.

### 5. Notification System
FCM (Firebase Cloud Messaging) use karke daily morning me 8:00 AM par notification bhejenge:
- *"Aaj ka DPP ready hai! Kya aap aaj 10/10 score kar sakte hain? 🚀"*

Enjoy learning! 
