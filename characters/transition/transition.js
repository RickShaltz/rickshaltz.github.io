import { Transition_Choices } from "./transition_choices.js"
import { Character } from "../../character_manager/character.js"
import { Dialogue } from "../../dialogue_classes/dialogue.js"

export class Transition extends Character{
    constructor(){
        super("")
        this.set_possible_dialogue()
        this.set_colors()
        this.load_images()
        this.load_audio()

        this.character_choices = new Transition_Choices()
    }

    set_possible_dialogue(){
        this.dialogue_path = new Dialogue("in_transition")
        this.possible_dialogue = {
            "in_transition" : ["{Speaker:}(Spacebar to see the next client)", "(Next_Char)in_transition"],
        }
    }

    load_images(){
    }

    load_audio(){
    }
}