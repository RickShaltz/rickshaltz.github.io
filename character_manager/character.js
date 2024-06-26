import { Dialogue } from "../dialogue_classes/dialogue.js"
import { Character_Choices } from "./character_choices.js"

export class Character{
    constructor(name){
        this.name = name
        this.audio = null
        this.dialogue = ""
        this.dialogue_number = 0

        this.possible_dialogue = {}
        this.dialogue_path = new Dialogue("")

        this.allowed_reactions = []
        this.possible_response_dialogue = []
        this.already_responded_to = []
        this.response_dialogue_path;

        this.character_choices;

        this.images = new Map()

        this.text_color = "rgba(255, 255, 255, 1)"
        this.border_color = "rgba(255, 255, 255, 1)"

        this.fade = 0
        this.fade_out = false

        this.character_choices = new Character_Choices()
    }

    set_dialogue(event_handler, dialogue){
        var text_box = event_handler.text_box
        var choice_display = event_handler.choice_display
        var cult_stats = event_handler.cult_stats
        var character_manager = event_handler.character_manager
        var image_manager = event_handler.image_manager

        var text_path = ""
        if (this.response_dialogue_path != null){
            text_path = this.response_dialogue_path.dialogue
        } else {
            text_path = this.dialogue_path.original_dialogue
        }

        if (!this.dialogue_path.check_requirements(cult_stats)){
            character_manager.meet_next_character(event_handler)
            return false
        }

        if (this.dialogue_number < this.possible_dialogue[text_path].length){
            if (dialogue != null){
                var dialogue_obj = new Dialogue(dialogue)
            } else {
                var dialogue_obj = new Dialogue(this.possible_dialogue[text_path][this.dialogue_number])
            }

            switch(true){
                case !dialogue_obj.check_requirements(cult_stats):
                    this.dialogue_number ++;
                    this.set_dialogue(event_handler)
                    break;
                case dialogue_obj.dialogue.slice(0, 9) == "{Speaker:":
                    var speaker = dialogue_obj.dialogue.slice(9, dialogue_obj.dialogue.indexOf("}"))
                    text_box.set_character_speaking(speaker, this.text_color, this.border_color)
                    var cut_dialogue = dialogue_obj.dialogue.slice(dialogue_obj.dialogue.indexOf("}") + 1, dialogue_obj.dialogue.length)
                    this.set_dialogue(event_handler, cut_dialogue)
                    break;
                case dialogue_obj.dialogue.slice(0, 4) == "(Go)":
                    var cut_dialogue = dialogue_obj.dialogue.slice(4, dialogue_obj.dialogue.length)
                    this.set_dialogue_path(cut_dialogue)
                    this.set_dialogue(event_handler)
                    break;
                case dialogue_obj.dialogue.slice(0, 8) == "(Choice)":
                    this.initiate_choice(dialogue_obj.dialogue.slice(8, dialogue_obj.dialogue.length), text_box, choice_display, cult_stats)
                    break;
                case dialogue_obj.dialogue.slice(0, 14) == "(End_Reaction)":
                    this.reset_response_dialogue()
                    this.set_dialogue(event_handler)
                    break;
                case dialogue_obj.dialogue.slice(0, 5) == "(End)":
                    this.fade = 0
                    this.set_dialogue_path(dialogue_obj.dialogue.slice(5, dialogue_obj.dialogue.length))
                    character_manager.set_character_focus("", event_handler)
                    image_manager.fade_images()
                    cult_stats.stats["Encounters"] += 1
                    break;
                case dialogue_obj.dialogue.slice(0, 12) == "{Background:": // enter image
                    var image_name = dialogue_obj.dialogue.slice(12, dialogue_obj.dialogue.indexOf("}"))
                    image_manager.set_background(this.images[image_name])
                    var cut_dialogue = dialogue_obj.dialogue.slice(dialogue_obj.dialogue.indexOf("}") + 1, dialogue_obj.dialogue.length)
                    this.set_dialogue(event_handler, cut_dialogue)
                    break;
                case dialogue_obj.dialogue.slice(0, 1) == "{": // enter image
                    var image_name = dialogue_obj.dialogue.slice(1, dialogue_obj.dialogue.indexOf(":"))
                    var image_location = dialogue_obj.dialogue.slice(dialogue_obj.dialogue.indexOf(":") + 1, dialogue_obj.dialogue.indexOf("}"))

                    if (image_name in image_manager.images){
                        image_manager.images[image_name].set_location(image_location, this.images, image_manager)
                    } else {
                        image_manager.add_image(image_name, this.images[image_name], image_location)
                    }
                    var cut_dialogue = dialogue_obj.dialogue.slice(dialogue_obj.dialogue.indexOf("}") + 1, dialogue_obj.dialogue.length)
                    this.set_dialogue(event_handler, cut_dialogue)
                    break;
                case dialogue_obj.dialogue.slice(0, 10) == "(Keyboard)":
                    var text = dialogue_obj.dialogue
                    event_handler.allow_keyboard_input(text.slice(10, text.indexOf("=")), text.slice(text.indexOf("=") + 1, text.length))
                    break;
                case dialogue_obj.dialogue.slice(0, 10) == "(Autosave)":
                    var cut_dialogue = dialogue_obj.dialogue.slice(10, dialogue_obj.dialogue.length)
                    this.set_dialogue(event_handler, cut_dialogue)
                    event_handler.save('autosave')
                    break;
                case dialogue_obj.dialogue.slice(0, 15) == "(Load_Autosave)":
                    var cut_dialogue = dialogue_obj.dialogue.slice(15, dialogue_obj.dialogue.length)
                    this.set_dialogue(event_handler, cut_dialogue)
                    event_handler.load('autosave')
                    break;
                case dialogue_obj.dialogue.slice(0, 7) == "(Death)":
                    this.fade = 0
                    this.set_dialogue_path(dialogue_obj.dialogue.slice(7, dialogue_obj.dialogue.length))
                    character_manager.set_character_focus("Death", event_handler)
                    image_manager.fade_images()
                    break;
                // for minigames only
                case dialogue_obj.dialogue.slice(0, 10) == "(Initiate:":
                    var minigame = dialogue_obj.dialogue.slice(10, dialogue_obj.dialogue.indexOf(")"))
                    var cut_dialogue = dialogue_obj.dialogue.slice(dialogue_obj.dialogue.indexOf(")")+1, dialogue_obj.dialogue.length)
                    event_handler.set_active_minigame(minigame, cut_dialogue)
                    break;
                // Should only be used by transition.js
                case dialogue_obj.dialogue.slice(0, 11) == "(Next_Char)":
                    this.set_dialogue_path(dialogue_obj.dialogue.slice(11, dialogue_obj.dialogue.length))
                    character_manager.meet_next_character(event_handler)
                    break;
                default:
                    this.dialogue = dialogue_obj.dialogue
                    text_box.set_text(this.dialogue, cult_stats)
                    break;
            }
        }
    }

    reset_intro(){
        this.fade = 0
    }

    set_dialogue_path(dialogue_path){
        var path = dialogue_path
        for (var i in this.possible_dialogue){
            if (i.includes(">") && i.slice(i.indexOf(">") + 1, i.length) == dialogue_path){
                path = i
            }
        }
        this.dialogue_path = new Dialogue(path)// cont
        this.dialogue_number = 0
    }


    next_dialogue(event_handler){
        this.dialogue_number++
        this.set_dialogue(event_handler)
    }

    set_colors(text_color, border_color){
        if (text_color != null){
            this.text_color = text_color
        }

        if (border_color != null){
            this.border_color = border_color
        }
    }

    initiate_choice(choice, text_box, choice_display, cult_stats){
        this.character_choices.initiate_choice(choice, this.possible_dialogue, text_box, choice_display, cult_stats)
    }

    update_reactions(cult_stats){
        this.allowed_reactions = []
        for (var i in this.possible_response_dialogue){
            var dialogue = new Dialogue(this.possible_response_dialogue[i])
            if (dialogue.check_requirements(cult_stats) && !this.already_responded_to.includes(this.possible_response_dialogue[i])){
                this.allowed_reactions.push(dialogue.dialogue);
            }
        }

        if (this.allowed_reactions.length > 0){
            var random_reaction_index = this.randint(0, this.allowed_reactions.length)
            this.response_dialogue_path = new Dialogue(this.allowed_reactions[random_reaction_index])
            this.already_responded_to.push(this.response_dialogue_path.dialogue)
        }
    }

    reset_response_dialogue(){
        this.dialogue_number = 0
        this.response_dialogue_path = null  
    }

    // method override this
    show(text_box){
        text_box.show(this.fade)

        if (this.fade < 255){
            this.fade += 5
        }
    }

    load_images(){

    }

    load_audio(){

    }

    randint(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
      }
}