<template>
  <!-- FILE: <project>/frontend/src/components/ConsoleView.vue -->
    <!-- div id="console-output"></div -->
    <iframe id="output" name="output" :src="iframe.src"> </iframe>
  
</template>

<script>
export default {
  name: "ConsoleView",
  data() {
    return {    
      iframe: {
        src: "/static/_try.html",
      },
    };
  },
  mounted() {
    
  },
  methods: {
    renderHTML(compiledCode) {
      let old_output = document.getElementById("output");
      let styleAttr = old_output.style.cssText;
      
      old_output.remove();
      let output = document.createElement('iframe');
      document.getElementById('app').appendChild(output);
      output.setAttribute('id','output');
      output.setAttribute('name','output');
      output.setAttribute('style',styleAttr);
      output.setAttribute('onload','dividerAction()')
      output.contentWindow.document.open();
      output.contentWindow.document.write(compiledCode);
      output.contentWindow.document.close();

      // let outputFrame = document.getElementById('output');
      // let outputDom = outputFrame.contentDocument || outputFrame.contentWindow.document;
      // outputDom.removeChild(outputDom.documentElement);
      // outputDom.open();
      // outputDom.write(compiledCode);
      // outputDom.close();
    },
  }
};
</script>

<style>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");

:root {
  --light-grey: #e0e0e0;
  --gery: #a0a0a0;
}

i {
  cursor: pointer;
  height: 1em;
  width: 1em;
}

#console-output {
  flex-grow: 1;
  padding-left: 0.5em;
}

#console-output code {
  white-space: pre-wrap;
  overflow: auto;
}

.timestamp {
  font-weight: bold;
  color: var(--grey);
}

pre {
  white-space: pre-line;
  margin: 0;
  margin-top: -1em;
}
</style>
