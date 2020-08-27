# Wild West

Wild West is an anonymous local-area chat website designed around the values of privacy and freedom of speech. When you load the website, you will be prompted to give location access - but don't worry - the location data is scrambled on the client side before being sent to the server, which is then used to group you with people in your area. You may have the opportunity to interact with someone you know, a person across the street, or a complete stranger. This is a website where there are no strict rules or limitations, where you are thrown into a vast sea of anonymity that can only be described as the Wild West...

Features:

* When you post to Wild West, only other users who are physically nearby (currently within 200 miles) can read and reply to your post.

* Your posts are only identified by your scrambled location and your randomly generated UserID.

* Your UserID is created on the client side, and can be reset at any point by simply clearing the website's cookie. Therefore, using your browser's "incognito mode" can actually keep you anonymous for once.

## How to host

1. `git clone https://github.com/alex1115alex/Wild-West-Backend.git`
2. Setup your postgres database using the instructions in "CreateDatabase.txt". In short, you need a database named "Wild-West" with the password "WildWest", using the user "postgres".
3. `node index.js`

Dependencies:
* express
* pg
* postgresql
