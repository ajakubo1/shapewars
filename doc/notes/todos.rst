Todo:

    
    * checking winning conditions? :D
    * visualize winning dialog :D
    * map generation
        I will create types of maps manually, it will be nicer :)
    * first page for the game!
    * remove middleground
    * REVERSING the objective?!
        
        * change the objective after some timeout (60 seconds)
        
        * objectives:
        
            * conquer all OBJECTIVE.CONQUER_ALL
            * conquer specific player OBJECTIVE.CONQUER_PLAYER
            * none OBJECTIVE.FREE
            
            
        * restrictions:
            
            * none RESTRICTION.NONE
            * only neutral can be attacked RESTRICTION.NEUTRAL
            * only players  RESTRICTION.PLAYERS
            * can't attack  RESTRICTION.PEACE
            * only specific player RESTRICTION.ONE_PLAYER
            
        * combos:
            
            * Mandatory:
            
                * OBJECTIVE.CONQUER_ALL & RESTRICTION.NONE
                * OBJECTIVE.FREE can't be with RESTRICTION.NONE
            
            * Optional
            
                * OBJECTIVE.CONQUER_PLAYER & RESTRICTION.PLAYERS
                * OBJECTIVE.CONQUER_PLAYER & RESTRICTION.ONE_PLAYER
                
                * OBJECTIVE.FREE & RESTRICTION.NEUTRAL
                * OBJECTIVE.FREE & RESTRICTION.PLAYERS
                * OBJECTIVE.FREE & RESTRICTION.PEACE
                * OBJECTIVE.FREE & RESTRICTION.ONE_PLAYER
            
        TODO: Message: Reversing objective!
        TODO: Objective indicator
        TODO: Restriction indicator
            
        
    * bugs: monitor attacked_tile for user
    * adding new listeners (touch listener)
    * Pausing game...
    * Visualise minion generation
    * Network communication
    * Zoom in/zoom out
    * animations for changing squares?
    * animations
    * music


Done:

    * check what happens if you choose to attack another square DONE
    * add attack posibilities for squares which are further away DONE
    * AI
    * Visualise how many minions can be generated per tile
    * Visualise minion health
    * Correcting attack algorithm, so that we can attack tiles of different players
    * review the conquest algorithm
    * defence algorithm
    * Create algorithm for when attacking the same tile by 2 players (or defend)
