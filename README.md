# Wild West

Wild West is an anonymous local-area chat website designed around the values of privacy and freedom of speech.

Features:

* When you post to Wild West, only other users who are physically nearby (currently within 200 miles) can read and reply to your post.

* Your posts are only identified by your scrambled location, as well as your UserID

* Your UserID is created on the client side, and can be reset at any point simply by clearing the cookie. Therefore, using your browser's "incognito mode" can actually keep you anonymous for once.

## How to run

1. `git clone https://github.com/alex1115alex/Wild-West-Backend.git`
2. Setup your postgres database using the instructions in "CreateDatabase.txt". In short, you need a database named "Wild-West" with the password "WildWest", using the user "postgres".
3. `node index.js`

Dependencies:
* express
* pg
* postgresql