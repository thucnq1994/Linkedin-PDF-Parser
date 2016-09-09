var path = require('path')
var filePath = path.join(__dirname, 'pdf_file_name.pdf')
let fs = require('fs'),
PDFParser = require("pdf2json/PDFParser");

let pdfParser = new PDFParser();

function get_linkedin_recommended_page_index(page){
  for (var p = 0; p <= page.length - 1; p++) {
    for (var i = 0; i <= page[p].Texts.length - 1; i++) {
      if( page[p].Texts[i].oc === '#333333' && page[p].Texts[i].x === 2 && page[p].Texts[i].y === 2.544 && page[p].Texts[i].sw === 0.32553125 && page[p].Texts[i].clr === -1 & page[p].Texts[i].R[0].TS[1] === 24 && page[p].Texts[i].R[0].TS[2] === 1 && p !== 0 ) {
        return p;
      }
    }
  }
  return -1;
}

function get_linkedin_recommended(raw_text){
  var ret = [];
  for (var j = 7; j <= raw_text.length - 2; j++) {
    if(raw_text[j].R[0].T === 'Page' && raw_text[j].R[0].TS[1] === 13 && !isNaN(raw_text[j+1].R[0].T) && raw_text[j+1].R[0].TS[1] === 13 || !isNaN(raw_text[j].R[0].T) && raw_text[j].R[0].TS[1] === 13 && raw_text[j-1].R[0].T === 'Page' && raw_text[j-1].R[0].TS[1] === 13) {
            
    } else {
      //ret.push(raw_text[i]);
      if(j > 7 && raw_text[j].y === raw_text[j-1].y) {
        var str = ret[ret.length - 1];
        str = str + decodeURIComponent(raw_text[j].R[0].T);
        ret[ret.length - 1] = str;
      } else {
        if(raw_text[j].clr === -1 && raw_text[j-1].clr === -1) {
          var str = ret[ret.length - 1];
          str = str + decodeURIComponent(raw_text[j].R[0].T);
          ret[ret.length - 1] = str;
        } else {
          ret.push(decodeURIComponent(raw_text[j].R[0].T));
        }
      }
    }
  }
  return ret;
}

function get_content(raw_text, part_name){
  var ret = [];
  for (var i = 0; i <= raw_text.length - 1; i++) {
    if( decodeURIComponent(raw_text[i].R[0].T) === part_name && raw_text[i].clr === 4 && raw_text[i].R[0].TS[1] === 19 ) {
      for (var j = i+1; j <= raw_text.length - 1; j++) {
        if(raw_text[j].clr === 4 && raw_text[j].R[0].TS[1] === 19){
          break;
        } else {
          if(raw_text[j].R[0].T === 'Page' && raw_text[j].R[0].TS[1] === 13 && !isNaN(raw_text[j+1].R[0].T) && raw_text[j+1].R[0].TS[1] === 13 || !isNaN(raw_text[j].R[0].T) && raw_text[j].R[0].TS[1] === 13 && raw_text[j-1].R[0].T === 'Page' && raw_text[j-1].R[0].TS[1] === 13) {
            
          } else {
            //ret.push(raw_text[i]);
            if(raw_text[j].y === raw_text[j-1].y) {
              var str = ret[ret.length - 1];
              str = str + decodeURIComponent(raw_text[j].R[0].T);
              ret[ret.length - 1] = str;
            } else {
              ret.push(decodeURIComponent(raw_text[j].R[0].T));
            }
          }
        }
      }
    }
  }
  return ret;
}

function get_user_info(raw_text){
  var ret = {};
  for (var i = 0; i <= raw_text.length - 1; i++) {
    if( raw_text[i].oc === '#333333' && raw_text[i].x === 2 && raw_text[i].y === 2.544 && raw_text[i].sw === 0.32553125 && raw_text[i].clr === -1 & raw_text[i].R[0].TS[1] === 24 && raw_text[i].R[0].TS[2] === 1 ) {
      ret.name = decodeURIComponent(raw_text[i].R[0].T);
      ret.position = decodeURIComponent(raw_text[i+1].R[0].T);
      ret.email = decodeURIComponent(raw_text[i+2].R[0].T);
      break;
    }
  }
  return ret;
}

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {

  var recommended_page = get_linkedin_recommended_page_index(pdfData.formImage.Pages);
  var text_array = [];
  for (var i = 0; i <= pdfData.formImage.Pages.length - 1; i++) {
    if(i < recommended_page) {
      text_array = text_array.concat(pdfData.formImage.Pages[i].Texts);
    } else {
      break;
    }
  }
  var text_recommended_array = [];
  for (var i = recommended_page; i <= pdfData.formImage.Pages.length - 1; i++) {
    text_recommended_array = text_recommended_array.concat(pdfData.formImage.Pages[i].Texts);
  }

  // var ret = get_content(text_array, 'Volunteer Experience');
  var ret = get_user_info(text_array);
  // var ret = get_linkedin_recommended_page_index(pdfData.formImage.Pages);
  // var ret = get_linkedin_recommended(text_recommended_array);
  console.log(ret);
});

pdfParser.loadPDF(filePath);