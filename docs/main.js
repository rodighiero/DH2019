!function(e){function t(t){for(var o,c,i=t[0],l=t[1],a=t[2],f=0,y=[];f<i.length;f++)c=i[f],Object.prototype.hasOwnProperty.call(r,c)&&r[c]&&y.push(r[c][0]),r[c]=0;for(o in l)Object.prototype.hasOwnProperty.call(l,o)&&(e[o]=l[o]);for(d&&d(t);y.length;)y.shift()();return s.push.apply(s,a||[]),n()}function n(){for(var e,t=0;t<s.length;t++){for(var n=s[t],o=!0,i=1;i<n.length;i++){var l=n[i];0!==r[l]&&(o=!1)}o&&(s.splice(t--,1),e=c(c.s=n[0]))}return e}var o={},r={0:0},s=[];function c(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,c),n.l=!0,n.exports}c.m=e,c.c=o,c.d=function(e,t,n){c.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},c.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},c.t=function(e,t){if(1&t&&(e=c(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(c.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)c.d(n,o,function(t){return e[t]}.bind(null,o));return n},c.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return c.d(t,"a",t),t},c.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},c.p="";var i=window.webpackJsonp=window.webpackJsonp||[],l=i.push.bind(i);i.push=t,i=i.slice();for(var a=0;a<i.length;a++)t(i[a]);var d=l;s.push([4,1]),n()}([,function(e,t,n){e.exports=n.p+"nodes.json"},function(e,t,n){e.exports=n.p+"links.json"},function(e,t,n){},function(e,t,n){"use strict";n.r(t);n(3);var o=n(0);let r={distance:30,densityData:[],zoomIdentity:null,screen:{},colors:{backgroundLeft:o.rgb(255,144,104),backgroundRight:o.rgb(253,116,108),contours:o.rgb(251,158,129),keywords:o.rgb(100,79,39),nodes:o.rgb(39,72,100)},style:{fontKeywords:"normal 300 1.2pt Helvetica",lineHeightKeywords:2.4,fontNodes:"bold 1.8pt Helvetica"},setScreen:()=>{r.canvas=o.select("canvas"),r.context=document.querySelector("canvas").getContext("2d"),r.context.scale(2,2),r.screen.density=1;const e=document.getElementById("simulation");r.screen.width=e.clientWidth*r.screen.density,r.screen.height=e.clientHeight*r.screen.density,r.canvas.style("width",`${e.clientWidth}px`).style("height",`${e.clientHeight}px`).attr("width",r.screen.width).attr("height",r.screen.height),r.gradient=r.context.createLinearGradient(0,0,r.screen.width/2,0),r.gradient.addColorStop(0,r.colors.backgroundLeft),r.gradient.addColorStop(1,r.colors.backgroundRight)}};const c=2*Math.PI;var i=()=>{(()=>{const e=o.extent(r.nodes,e=>e.x),t=o.extent(r.nodes,e=>e.y),n=e[1]-e[0],s=t[1]-t[0],c=e[0],i=t[0];r.densityData=o.contourDensity().x(e=>e.x-c).y(e=>e.y-i).weight(e=>e.docs).size([n,s]).cellSize(10)(r.nodes),r.densityData.forEach(e=>e.coordinates=e.coordinates.map(e=>e.map(e=>e.map(e=>[e[0]+c,e[1]+i]))))})();const e=o.geoPath().context(r.context);r.densityData.forEach((t,n)=>{r.context.beginPath(),e(t),r.context.strokeStyle=r.colors.contours,r.context.lineWidth=1,r.context.stroke()})},l=()=>{const e=s.zoomIdentity.x*s.screen.density,t=s.zoomIdentity.y*s.screen.density,n=s.zoomIdentity.k;s.context.save(),s.context.clearRect(0,0,s.screen.width,s.screen.height),s.context.fillStyle=s.gradient,s.context.fillRect(0,0,s.screen.width,s.screen.height),s.context.translate(e,t),s.context.scale(n,n),i(),(()=>{const e=Math.pow(20,2),t=Math.pow(60,2);r.links.forEach(n=>{const o=Math.abs(n.source.x-n.target.x),s=Math.abs(n.source.y-n.target.y),c=Math.pow(o,2)+Math.pow(s,2);if(e<c&&c<t){const e=Object.getOwnPropertyNames(n.tokens).slice(0,3),t=o/2+(n.source.x<n.target.x?n.source.x:n.target.x),c=s/2+(n.source.y<n.target.y?n.source.y:n.target.y),i=e.length*r.style.lineHeightKeywords;e.forEach((e,n)=>{r.context.beginPath(),r.context.fillStyle=r.colors.keywords,r.context.textAlign="center",r.context.font=r.style.fontKeywords,r.context.fillText(e,t,c+i/2+n*r.style.lineHeightKeywords),r.context.fill()})}})})(),r.context.beginPath(),r.context.fillStyle=r.colors.nodes,r.context.font=r.style.fontNodes,r.context.textAlign="center",r.nodes.forEach(e=>{r.context.moveTo(e.x,e.y),r.context.arc(e.x,e.y,.5,0,c),r.context.fillText(`${e.id} (${e.docs})`,e.x,e.y+4)}),r.context.fill(),s.context.restore()};window.s=r,r.zoomIdentity=o.zoomIdentity;var a=()=>{const e=o.forceSimulation().force("charge",o.forceManyBody().strength(-500).distanceMin(60)).force("collide",o.forceCollide().radius(r.distance).strength(.2).iterations(5)).force("center",o.forceCenter(r.screen.width/2,r.screen.height/2)).force("link",o.forceLink().id(e=>e.id).strength(e=>e.value));e.nodes(r.nodes),e.force("link").links(r.links);e.on("tick",l).on("end",()=>{r.end=!0}),r.zoom=o.zoom().on("zoom",()=>{r.zoomIdentity=o.event.transform,l()}),r.zoom.scaleExtent([.1,10]),r.zoom.scaleTo(r.canvas,.3),r.canvas.call(r.zoom),r.canvas.on("mousemove",()=>{const e=r.zoomIdentity.invertX(event.x*r.screen.density),t=r.zoomIdentity.invertY(event.y*r.screen.density);for(let s=r.nodes.length-1;s>=0;--s){const c=r.nodes[s],i=e-c.x,l=t-c.y;let a=[];for(var n in c.tokens){const e=c.tokens[n].toFixed(2);a.push(`${n} (${e})`)}if(i*i+l*l<900){let e="";e+=`<p><strong>${c.id}</strong></p>`,e+=`<p>Number of papers: ${c.docs}</p>`,e+=`<p>Tokens:<br/>${a.join("<br/>")}</p>`,o.select("#focus").html(e)}}})},d=n(1),f=n.n(d),y=n(2),h=n.n(y);window.d3=o,Promise.all([o.json(f.a),o.json(h.a)]).then(([e,t])=>{r.setScreen(),r.links=t,r.nodes=e,console.log("nodes",r.nodes.length),console.log("links",r.links.length),a()})}]);