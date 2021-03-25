<template>
  <!-- FILE: <project>/frontend/src/App.vue -->
  <div id="app">
    <div id="editor">
      <div id="options">
        <!-- Click on "Run" triggers the compiling process -->
        <div
          @click="compileToElm"
          class="button blue"
          title="Compile your code (Ctrl-Enter)"
        >
          Compile<span></span>
        </div>
      </div>
      <div
        id="xtext-editor"
        :data-editor-xtext-lang="this.dslFileExtension"
      ></div>
    </div>
    <div id="divider"></div>
    <ConsoleView />
  </div>
</template>

<script>
import { protocol, baseUrl } from "@/services/ConnectionData.js";
import ConsoleView from "@/components/ConsoleView";
import CompilerService from "@/services/CompilerService";

export default {
  name: "App",
  components: {
    ConsoleView,
  },
  data() {
    return {
      xtextEditor: null,
      scriptContainer: null,
      dslFileExtension: "",
    };
  },
  mounted() {
    /* If the _xtext object is not null when we mount this component, we can continue
      to configure our editor, otherwise we will wait for the 'ready' event */
    !window._xtext
      ? window.xtextReadyEvent.on("ready", this.setXtextEditor)
      : this.setXtextEditor();
  },
  methods: {
    setXtextEditor() {
      /* This serviceUrl contains the URL, on which the language server is reachable */
      this.dslFileExtension = window._dslFileExtension;

      /* We have to wait until rendering of this.dslFileExtension
        in data-editor-xtext-lang attribute finishes
        before we initialize the editor */
      this.$nextTick(() => {
        this.xtextEditor = window._xtext.createEditor({
          baseUrl: "/",
          serviceUrl: `${protocol}${baseUrl}xtext-service`,
          // syntaxDefinition: `xtext-resources/generated/mode-${this.dslFileExtension}.js`,
          syntaxDefinition: "xtext-resources/generated/mode-oe.js",
          enableCors: true,
          lineNumbers: true,
          value: "myShapes time = [\n  circle 50 |> filled red\n  ]",
          theme: "idea",
          mode: "elm",
          extraKeys: {
            "Ctrl-Enter": this.compileToElm
          },
          matchBrackets: true,
          tabSize: 2,
          indentWithTabs: false,
        });
      });
    },
    async compileToElm() {
      try {
        // Take the editor content and send it to the backend
        const response = await CompilerService.compileCode(
          this.xtextEditor.getValue()
        );
        const compiledCode = response.data.code;
        // Execute the compiled code
        ConsoleView.methods.renderHTML(compiledCode);
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  align-items: center;
  justify-content: center;
  display: flex;
  width: 100%;
}

#app {
  display: flex;
  width: 100%;
  /*font-family: Avenir, Helvetica, Arial, sans-serif;*/
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.controls,
.content {
  width: 100%;
}

.content {
  display: flex;
  min-height: 100%;
}

#xtext-editor {
  position: relative;
  height: calc(100% - 36px);
  width: auto;
  border-right: 1px solid #000;
}

</style>
