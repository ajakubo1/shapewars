.. _attack:


======
Attack
======

When player clicks on a field he'd like to attack, the closest square is located to square he clicked.

e.g:
    Player clicked on x,y
    We have to check if neighbours are of player and have any minions
    if so, neighbour square is returned

Attack is performed as follows: all of the currently created minions are attacking the square, at first they are moving towards the square. Then they choose subfields to attack (there are 4 * 5 = 20 subsquares in each square).

The base health of each subsquare is equal to 30.

Minions loose health during the attack - the base health of minion is equal to 60.

Minions are attacking chosen square until they are dead (they are loosing their health in order to conquer the subsquare).

When a square is not attacked for 10 seconds (or directly after takeover), it starts to regenerate

Additional health for each of square is based on player's minion limit
