import { Escape_Menu } from "./escape_menu/escape_menu.js";

export class Display {
    constructor(){
        this.loading = 0
        this.load_ready = false

        this.menu_open = false
        this.escape_menu = new Escape_Menu();
    }

    show(event_handler){ // user_input, text_box, cult_stats, character_manager, choice_display, image_manager,
        var user_input = event_handler.user_input
        var text_box = event_handler.text_box
        var cult_stats = event_handler.cult_stats
        var character_manager = event_handler.character_manager
        var choice_display = event_handler.choice_display
        var image_manager = event_handler.image_manager

        if (this.loading < 100){
            fill(255, 255, 255)
            textSize(40)
            text("LOADING", windowWidth/2, windowHeight/2)
            rect(windowWidth/2, windowHeight/3, windowWidth*3/4 *this.loading/100, 50)
        } else if (!this.load_ready){
            text("Press Anything To Start", windowWidth/2, windowHeight/2)
        } else if (this.menu_open) {
            this.escape_menu.show()
        }
        
        else if (event_handler.take_user_keyboard){
            this.show_name_selection(user_input, event_handler.message)
        } 

        // Actual in game display
        else if (this.load_ready){
            image_manager.show(event_handler)
            character_manager.show(text_box)
            cult_stats.show()
            choice_display.show()
        }
    }

    ready(){
        this.load_ready = true
    }
        
    show_name_selection(user_input, message){
        fill(255, 255, 255)
        text(message, windowWidth/2, windowHeight/3)
        text(user_input, windowWidth/2, windowHeight/2)
    }

    update_loading(){
        if (this.loading < 100){
            this.loading += 1
        }
    }

    trigger_click(event_handler) {
        if (this.menu_open) {
            this.escape_menu.trigger_click(event_handler);
        }
    }
}