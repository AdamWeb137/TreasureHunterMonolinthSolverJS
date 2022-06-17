# Credits
The algorithm this code uses was originally developed by [Azsheme on github](https://github.com/Azshene/THM_Solver). More specifically, I based this code on a tweaked version by [DanLeEpicMan](https://github.com/DanLeEpicMan/UpdatedMonolithSolver/). These projects opened my eyes to how pathfinding algorithms and a* can be used for things other than pathfinding.

# Available Platforms

This program was developed on Firefox on 101.01 and was tested with Chromium. It should probably work on other browsers as well (maybe not internet explorer). This program was designed for a desktop computer, so using it on a phone is not recomended.

# Instructions

Go to [https://adamweb137.github.io/TreasureHunterMonolinthSolverJS/](https://adamweb137.github.io/TreasureHunterMonolinthSolverJS/)

## Input Mode

You must first duplicate a board from the "Treasure Hunter Monolinth" Minigame in Danganronpa V3. This is what I'll refer to as input mode.

Click on any square to select it. You can then click the corresponding color on the bottom. You can also press 0-4 on your keyboard. The next square will automatically be selected. You can also use the arrow keys to move and select squares.

You can also mark a block as being part of a fish fossil or monocub. Click on the correspoding button or press "M" for monocub, "F" for fish, or "N" for nothing.

### Set Board from Screenshot

You can set the board from a screenshot. The screenshot must be cropped to only the blocks. Do not take a screenshot of the whole window. Upload the image from the "Browse" button on the top of the screen. Once uploaded, the board will automatically be changed.

This feature doesn't mark items as monocubs or fishes, so be careful. I recomend only using it for the starting board, then editing everything else manually.

## Solve Mode

### Configuring

On the top of the page there are two sliders: one for score goal, and one for max searches. 

The score goal is the score necesary for a board to be considered a solution. I wouldn't recommend changing this because it is already set at the minimum for S rank. The algorithm may not reach this goal, and if that's the case, it will output the best possible solution.

The max searches tells the program how many boards to search. Again, I wouldn't recomend dropping this below 5000. More searches = more time waiting but a possibly better solution

### Solving

After you have completed duplication of the board, click "Solve" on the top of the screen. An alert will pop up telling you to be patient. Click it, and wait. It should take about a minute or less. This should take you to solve mode.

Here you should see the board you started with, with numbers labeled,  and each number represents a step in the solution. The next step will be more heavily outlined and in red, so you can see it. Click on the indicated block in game, and then click on the next step on the website to progress.

To get back to the 0th step (aka nothing cleared), press "0" or "Enter". You can also use the left and right arrow keys to go to the previous or next step.

### Going back to input mode

At this point you can click "Edit" to edit the board. The board editted will be the board shown on the current step.

# Controls Summary

## Input Mode

- Left Click (on block): Select block
- Left Click (on colored tile below board): Change selected block to selected color
- Arrow Keys: Select block to the left,right,top,bottom of the current selected block
- 0-4: Set block to corresponding color
- N,F,M: Set block to Nothing, Monocub, or Fish

## Solve Mode

- Left Click (on numbered block): Go to nth step
- Left Arrow: Go to previous step
- Right Arrow: Go to next step
- 0 / Enter: Go to 0th step
