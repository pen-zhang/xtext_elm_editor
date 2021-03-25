module Main exposing (..)

import GraphicSVG exposing(..)
import GraphicSVG.App exposing(..)
import Shapes exposing (..)

type Msg = Tick Float GetKeyState

type alias Model = 
  { time : Float}

-- MAIN
main : GameApp Model Msg
main = gameApp Tick
  { model = init
  , title = "ElmJrWeb"
  , update = update
  , view = view }

-- VIEW
view : Model -> Collage userMsg
view model = 
  collage 500 500 (myShapes model.time)

-- INIT
init : Model
init = { time = 0 }

-- UPDATE
update : Msg -> Model -> Model
update msg model =
  case msg of
    Tick time _ ->
      {model | time = time}