# An Elm Web Editor with Code Augmentation Using Xtext



## 1 Introduction

ElmJr is an iPad-based projectional editor to create shapes and animations using Elm. It is easy to use with direct manipulation of the textual representation of the abstract syntax. Students can simply tap on the parts of the program like keywords and typed holes, and choose or fill correct necessary information in the popup menu to complete the program. [^1]

[^1]: Graphics Programming in Elm Develops Math Knowledge & Social Cohesion

ElmJr is proved a successful projectional editing practice in teaching field. It brings up the context-based menu due to the advantages of projectional editing. This way of code completion plays a critical role in ElmJr. The text notation is the representation of the existing AST. Interactions with the text is namely operations on the node in AST, and every node points to its defining concept. This unambiguity reduce error rates. Finally, free from typing a bunch of text and syntax- and type-error lower the barrier for students to get started programming in Elm.  

However, the drawbacks of projectional editor is obvious as well. The restrictions of code edits results in verbose manipulations. For example, we have to create a new node and reinput information when changing a piece of code segment.

Is there a solution that keep the modification approach of the plain text editor and provide a context-sensitive code completion and structured code validation.

Xtext is a language development framework with a full modern language set including parser, linker,  typechecker, compiler. We can utilize this tool to develop a domain-specific language or general-purpose language. The most important feature used in this project is the highly configurable code completion and validation. Meanwhile, since version 2.9 Xtext offers an interface  for web editor implemented in JavaScript, which can augment the original text editors with the above features.[^2]

[^2 ]: [Xtext - Language Engineering Made Easy! (eclipse.org)](https://www.eclipse.org/Xtext/index.html)

By defining the Xtext grammar, the metamodel (i.e. Abstract Syntax Tree) behind our language is built. All Xtext services work around this metamodel. The input textual information consists of node models which must follow the structure of the metamodel. Xtext can provide validation or static analysis which gives informative feedback as users type. Not only automatic validation of any textual input based on the grammar is taken care of by Xtext, but also we can customize the validation against out model.

Developing a textual DSL identical to Elm can also achieve some same target as the projectional editing. Here, the DSL is limited to the same functionality as ElmJr, rather than aimed to the implementation of Elm language. A web text editor with customized Xtext service could be an alternative  of ElmJr.

## 2 Software Design

The DSL based on Xtext is the most critical part for the web text editor. It provides code augmentation which provides context-based code completion and validation in the plain-text code.

### 2.1 Language Metamodel

ElmJr imports the MacOutreach Graphic Library to create shapes and animations. It is a subset of Elm language. Here, the implementation of this web editor also focuses on these functionalities. 

The metamodel root "OnlineElm" is composed of a required "MainShape", and  multiple optional "ShapeDef" and "Local_var". 

As the required node, "MainShape" is built with as least one shape. This shape can be a single shape which is defined with "Stencil" and "Draw", or be chose in more options according to a condition, or be a reference to a shape. Meanwhile, we know that the the output of "MainShape" is a list, so we can also concatenated with another shape list. 

"ShapeDef" consists of two types of  nodes. One is used to define a single shape, and the other is used to define a list of shapes. The single shape can be referenced in the shape list. The shape list can be combined with the list output by "MainShape". 

Local_var" is used to define a constant to be referenced where a number is needed.

A shape is made up of "Stencil" and "Draw". Stencil is the shape function types like "circle" and "rect". Besides, a shape can passed to the "transform" type of functions to build a new shape like "move" and "rotate".

Such is the basic idea of the metamodel. Conditional, arithmetic, logic operations are also included to help build more complex shapes. Later, we will talk more details about the language grammar.

Below are part of the diagram and tree representations.

![image-20210318002748723](\Report.assets\image-20210318002748723.png)

![image-20210318002355863](\Report.assets\image-20210318002355863.png)

### 2.2 Web Editor 

The web editor consist of browser side and server side. 

What should be considered in the brower side is choice of the textual editor. The aforementioned three editors supported by Xtext are Orion, Ace, CodeMirror. Ace is the default one. But due to the widespread use of CodeMirror and in terms of the MacOutreach Web IDE, CodeMirror may be a better choice. The layout for the browser side is two columns: the left is the editor and the right is the output window of graphics.

As for the server side, it need the Xtext language server to provide the code augmentation and the Elm compiler. Xtext language server is discussed in section 3. Because the text in editor is not a whole Elm program, we have two options to complete the compile progress. Firstly, we can implement a code generator in Xtext to transform the text to a whole program, which is most operation in DSL. Secondly, given that this DSL is identical to Elm language, we can easily append the text to a existing Elm file to achieve the target. The second is apparently easier here. For scalability, we prepare a main file as the program entry and a shape file to accept the user input.

## 3 Implementation

In the section,  we will discuss the details in the implementation of this project to know how the editor is built.

### 3.1 Xtext service

1. Grammar

Xtext use its own domain-specific language  to define the grammar to describe the concrete syntax of your language. The grammar also shows how the input file will be mapped to a semantic model by the parser on-the-fly.

The language defined here is kept identical with the syntax in Elm. In line with the metamodel, we define the first rule "OnlineElm" as the start rule. It describes that the OnlineElm contains one MainShape and an arbitrary numbers (*) of ShapeDef and Local_var.

The second rule is how the MainShape is like in the file. It is the main function which outputs a list of "shape", and consumes a parameter "time". It must be led by keywords "myShapes time =", which show that this is a function and  it is exported to another Elm file. Then in the square brackets there are shapes separated by ',' if more than one shape exists. They can be also by formatted with NL which is spaces plus a new line. A shape is defined as above. It has three alternatives: a shape, a conditional which returns shape, or a reference to a shape. After the close bracket, we can choose to add references to shape lists which must be led by keywords "++" as the operation of concatenating lists in other languages. Otherwise, we can end this "MainShape" rule and add the other input.

The next is the "ShapeDef" rule. It is an alternative rule which defines two options "ShapeList" and "BasicShape". The structure of "ShapeList" is similar to "MainShape". But it is used to define a custom list which can be concatenated with "MainShape", and its name should follow the FQN rule same as a qualitied variable name in other languages. "BasicShape" is the rule of building a single shape variable.

Following the metamodel of the language, a model of shape is built by “Stencil" and "Draw". "Stencil" is a enumerated rule containing different rules corresponding to the stencil functions in Elm. The same is "Draw". It calls "Filled" or "Outlined" rule to consume the stencil and generate a shape. Meanwhile, it could be applied to "Transform" rule.

Here, we only discuss some key points in this DSL. More details can be found in Appendix.

Snippet of the grammar:

```java
OnlineElm:
	entry=MainShape
	(shapes+=ShapeDef)*
	(var+=Local_var)*
;


MainShape hidden (WS,NL):
	name='myShapes' 'time' '='
	'[' 
	  (shape = Shape | conditional = Conditional_Shape | shapeRef = [BasicShape|FQN])
	 (NL? ',' (moreShapes+=Shape | moreConditional += Conditional_Shape | moreShapeRef += [BasicShape|FQN]))*
	 NL? ']'
	(NL | ('++' external+=[ShapeList|FQN]))*
;

ShapeDef:
	ShapeList | BasicShape
;

ShapeList hidden (WS,NL):
	name=FQN '='
	'['
	 (shape = Shape | conditional = Conditional_Shape | shapeRef = [BasicShape|FQN])
	 (NL? ',' (moreShapes+=Shape | moreConditional += Conditional_Shape | moreShapeRef += [BasicShape|FQN]))* 
	 NL? ']'
	(NL | ('++' external+=[ShapeList|FQN]))*
;

BasicShape:
	name=FQN '=' NL? (shape = Shape | conditional = Conditional_Shape) NL?
;

Shape:
	stencil = Stencil '|>' draw = Draw
;

Draw:
	(filled = Filled | outlined = Outlined)  
	('|>' transform += Tranform)*
;
```



2. Web Editor support

We choose the CodeMirror from three JavaScript text editor libraties supported by Xtext. Xtext provides multiple services related to CodeMirror, for example, content assist, validation, syntax highlighting, semantic highlights, mark occurrences and so forth.

Because the default editor is Ace, we need to modify the MWE2 ( Modeling Workflow Engine) in order to start with the CodeMirror. MWE2 is like a configuration of the language generator. Change the framework in webSupport to "CodeMirror". Now, we can run MWE2 to generate our language. 

![image-20210324164818561](\Report.assets\image-20210324164818561.png)

Thus, we already have the web server which was generated for us. To start the web server, right click on the `*.web/` directory and choose `Run as -> Java Application`, search for the `ServerLauncher` of your project and confirm  with `OK`. We can look at the Example Expressions Web Editor in the browser.

![image-20210324165333665](\Report.assets\image-20210324165333665.png)

However, this editor only support default behaviors provided by Xtext service. It has the very basic content assist which provide context-based code completion, and validation which statically analyze codes and give informative feedback . We can continue to customized it to fulfill our requirements.

Here, we focused on the content assist support customization. The `*.ide` directory is used to hold these files. We create three `xtend` [^3] file in a new directory with postfix `*.contentassist`. 



![image-20210324170743159](\Report.assets\image-20210324170743159.png)

[^3 ]: Xtend is a statically-typed programming language which translates to comprehensible Java source code. It is used by default. You can also choose Java instead.

`OnlineElmWebContentProposalProvider` extends from `IdeContentProposalProvider` and is used to create proposals based on RuleCall, Keyword, Assignment, CrossReference. Let us look a simple example of create proposals for Color Rule. This is used in "Filled" rule for choosing a color. We can use switch cases to determine the current context based on `OnlineElmGrammarAccess` in the function `override dispatch createProposals(RuleCall ruleCall, ContentAssistContext context, IIdeContentProposalAcceptor acceptor)` . The final results is as follows after we registers `OnlineElmWebContentProposalProvider` at the `OnlineElmIdeModule` in the same project.

![image-20210324201813034](\Report.assets\image-20210324201813034.png)



![image-20210324201919241](\Report.assets\image-20210324201919241.png)



![image-20210324202503471](\Report.assets\image-20210324202503471.png)



![image-20210324202142713](\Report.assets\image-20210324202142713.png)

`ContentAssistEntry` is the entry point for the proposal. It also declares other properties which can be used to make further modifications. As follows, we can pass the typed text length of current `Filled` assignment in the `Draw` rule. In the web editor, CodeMirror can get this property to achieve the replacement of current "Filled" text when inserting a new proposal.

![image-20210324211539412](\Report.assets\image-20210324211539412.png)

`OnlineElmTemplateProposalProvider` is another choice to create proposal. It extends `AbstractIdeTemplateProposalProvider`, and create String template proposal.  For creating a MainShape proposal, we can define a function `CreateMainShapeProposal`. Then we still need to inject this class into `OnlineElmWebContentAssistProvider`, and invoke this function in the function based on RuleCall.

![image-20210324205826484](\Report.assets\image-20210324205826484.png)



![image-20210324210432839](\Report.assets\image-20210324210432839.png)

As for the `OnlineElmCrossRefProposalProvider` class, we can define proposals for CrossReference. But these proposals have been implemented in the previous file. Here, only a empty function is created to override the default proposals.

After we finish all custom actions, we can export this language server of Xtext service packed in a runnable JAR by `Export...` in menu. This language server will provide all xtext service for the web editor we will developed later.

![image-20210324212615760](\Report.assets\image-20210324212615760.png)



### 3.2 Front-end Web Page

We will build a web page containing an CodeMirror editor and an output window.  When we run the previous `*web` project in Eclipse, there are several web libraries behind the running of the Example Web Editor. We can find these files by adding `/webjars` to the hosted url. ( These files can be found in the public directory. They are contained in three folders webjars, xtext, and xtext-resources.)

The web page below is built on the Vue framework. How to integrate Xtext into it? After getting the libraries in the background, we should use RequireJs for managing modules and their dependencies.  Following is the integration setup. We configure the "jquery" and "xtext-codemirror" library paths and "codemirror" package. "xtext-codemirror" is the bridge between Xtext and codemirror. "codemirror" package is the full project. Then, we use xtext-codemirror.js service to create the code editor.

```js
// script snippet in index.html
require.config({
    baseUrl: baseUrl,
    paths: {
        jquery: 'webjars/jquery/<%= VUE_APP_JQUERY %>/jquery.min',
        'xtext/xtext-codemirror': 'xtext/<%= VUE_APP_XTEXT_CODEMIRROR %>/xtext-codemirror',
    },
    packages: [
        {
            name: 'codemirror',
            location: 'webjars/codemirror/5.59.1',
            main: 'lib/codemirror',
        },
    ],
});

require(['xtext/xtext-codemirror'], (xtext) => {
    _xtext = xtext;
    /* The editor (_xtext) is now ready to use.
        	We emit an 'ready' event to inform the App.vue component about it. */
    xtextReadyEvent.emit('ready');
    /* The information flow continues in the mounted function of the App.vue component. */
});
```

Next, we create a code editor instance and initialize Xtext service for it. And we configure some options such as lineNumbers and indentWithTabs.

```js
// snippet in App.vue
this.xtextEditor = window._xtext.createEditor({
    baseUrl: "/",
    serviceUrl: `${protocol}${baseUrl}xtext-service`,
    syntaxDefinition: `xtext-resources/generated/mode-${this.dslFileExtension}.js`,
    enableCors: true,
    lineNumbers: true,
    value: "myShapes time = [\n  circle 50 |> filled red\n  ]",
    theme: "idea",
    mode: "xtext/elm",
    extraKeys: {
        "Ctrl-Enter": this.compileToElm
    },
    matchBrackets: true,
    tabSize: 2,
    indentWithTabs: false,
});
```
Below is the final web page.

<img src="\Report.assets\image-20210324214213409.png" alt="image-20210324214213409" style="zoom: 50%;" />

### 3.3 Back-end Server

We are supposed to implement a server to invoke the Xtext language service to provide code augmentation and the Elm compiler to render a html file sent back to the output window on the front-end web page. Express.js framework is used to build this back-end server. We will talk about the data flow.

After the server starts, it should execute a directive to run the Jar of the Xtext. Code augmentation is the duty of Xtext language server.    We fire up the language server in the `LanguageServerService` file. Then we forward all request from the front-end to it.

When we click the "compile" button, this request will invoke the Elm compiler. We create an Elm project in advance, and prepare two files  `Main.elm` and `Shapes.elm`. Function "myShape" in the `Shapes.elm` is imported to `Main.elm` . And in `Shapes.elm` we input some necessary codes for the compilation process. The "compile" request will firstly do some file operation to append the input text append to the `Shapes.elm`. After that, it executes the `elm make --report=json src/Main.elm` command to compile the `Main.elm`, and send back the generated html file. The json report is used to render error messages when compilation failed, and we will send back a html with styled error messages.

```elm
module Shapes exposing (..)
import GraphicSVG exposing (..)

-- insert here
```

## 4 Problems  and Limitations

Compared to the ElmJr, this textual web editor tries to achieve the same error-free goal with the help of context-based proposals and auto-completion. The problems I met during the implementation process as follows:

1. When we encounter the position where a value is needed, although we can provide a proposal with a number as an example and descriptions to tell what to do, it need to delete the inserted value and input a new value. The abundant operation may be confusing.
2. We implement a replacement operation when the cursor is put in a word or in front of a word.  This operation is not as clear as in the ElmJr. We can choose the replace or delete options in the popup menu.
3. The popup menu does not have clear dividers though we actually sort them in different groups. A visual separation could be a better choice to quickly find the target option.
4. The popup menu only contains context-based proposals waiting to be inserted. It cannot provide diverse operations as in the ElmJr.
5. As a pure textual editor, it cannot provide a straightforward next step. The identity with Elm code is also a reason. It could be better for Juniors to mixed with graphical buttons. But we should also consider the misunderstanding of coding for them.
6. The formatting of codes is not as strict as in the ElmJr.  If one is not familiar with Elm and mess the codes accidentally in the editor. It would be a disaster.

Finally, this is not a well developed editor. There are lots of functionality supported by Xtext waiting to be realized. 

## 5 Future Development

This project is only a trial for textual Elm editor. It aims at an alternative of ElmJr, so it is limited to a very small part of Elm language. We can try to use Xtext framework to implement a full Elm language. With the support of Xtext service, it is possible to build a good code editor with multiple functionality like content assist,  hover information and validation. The informative feedback provided by the static analysis without compilation would be interesting. But the general purpose may cause the difficulty of providing accurate proposals. Nevertheless, this could be deserved to try.

We can continue to keep focusing on the specific purpose, but extend it to the whole MacOutreachGraphicSVG library. This could avoid the problems when implementing a general purpose language. As a consequence, we can still freely create a whole Elm program, not just code segments as in this project.

Orion editor library in Xtext  provide the most services. We can change CodeMirror to this library to fulfill all fuctionalities listed on the websites.[^ 4] The additional hover information can help get more details about the function or the input hole at current position.

[^4 ]:Xtext - Web Editor Support (eclipse.org)](https://www.eclipse.org/Xtext/documentation/330_web_support.html)

