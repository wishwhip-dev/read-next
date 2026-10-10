# Plan

Goal: A reading list for books I want to read: title, author, a note on why, and a done checkbox. Add, edit, mark done, and see done ones at the bottom. I use it on my phone and on my laptop, so I need a way to carry my list from one to the other.

1. The home page shows the reading list as a list of book rows, each showing its title, author, and the note on why it is wanted; books not yet read are listed first (newest at the top) and read ones appear in a separate 'Done' section at the bottom, with a readout like '3 of 8 read' at the top that updates the moment a checkbox is ticked
2. An 'Add book' button sits directly on the home page and opens a real form with labelled Title, Author and 'Why I want to read it' fields and a Save button; submitting it adds the book to the list immediately
3. Submitting the add or edit form with an empty Title shows an inline error beside the field and adds or changes nothing; Author and the note may be left empty and still save
4. Each book row has an Edit control that opens the same form pre-filled with that book's values, and saving updates the title, author, note or done state shown on the row
5. Each book has a checkbox that toggles its done state on tap or click; a book marked done moves into the Done section at the bottom straight away, and unchecking it moves it back up
6. Each book has a clearly labelled 'Delete' control that asks for confirmation before removing the book from the list, and confirming removes the row and its count from the readout at once
7. A very long title, author or note wraps onto multiple lines within its row without overlapping neighbouring rows or causing horizontal scrolling
8. With no books in the list, the home page shows an empty state inviting the first addition rather than a blank page
9. Books, edits and done states are saved to the Dexie database as they change: after adding two books, editing one and marking one done, reloading the page shows the same list in the same order with the same states
10. A settings screen reachable from the home page offers 'Move to another device' and pressing it shows a code, with a message shown when a wrong code is entered there
11. The whole form works from the keyboard: Tab reaches every field and each row's checkbox, Edit and Delete controls, and pressing Enter in the add form submits it
12. On a phone-sized screen the list and the add/edit form fit without horizontal scrolling and the buttons are large enough to tap
13. The app's name and description in app/identity.ts describe it as a personal reading list, and the browser tab title shows that name

These are the outcomes this task is judged against.