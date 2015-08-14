COMPRESSOR_HOME="/home/claim/software"
COMPRESSOR_YUI="yuicompressor-2.4.8.jar"
COMPRESSOR_HTML="htmlcompressor-1.5.3.jar"
PROJECT_DIR="/home/claim/programming/gamedev/shapewars"
BUILD_DIR="${PROJECT_DIR}/_build"
PROJECT_NAME="shapewars"
FILE_SIZE_LIMIT=13000

#functions:
function visualise() {
  a=0
  str="["
  while [ ${a} -lt 100 ]; do
    if [ ${a} -lt ${1} ]; then
      str=`echo "${str}#"`
    else
      str=`echo "${str}-"`
    fi
    a=$(($a + 1))
  done
  str=`echo "${str}]"`
  echo ${str}
}

#Remove mini/full folders
rm -rf "${BUILD_DIR}/${PROJECT_NAME}"
rm "${BUILD_DIR}/${PROJECT_NAME}.zip"

#create mini/full folders
mkdir "${BUILD_DIR}/${PROJECT_NAME}"

#generate folders
mkdir "${BUILD_DIR}/${PROJECT_NAME}/css"
mkdir "${BUILD_DIR}/${PROJECT_NAME}/js"

#cp files which don't have to be minified

#minify js and css files
java -jar "${COMPRESSOR_HOME}/${COMPRESSOR_YUI}" --type css "${PROJECT_DIR}/css/main.css" > "${BUILD_DIR}/${PROJECT_NAME}/css/main.css"

java -jar "${COMPRESSOR_HOME}/${COMPRESSOR_YUI}" --type js "${PROJECT_DIR}/js/main.js" > "${BUILD_DIR}/${PROJECT_NAME}/js/main.js"

java -jar "${COMPRESSOR_HOME}/${COMPRESSOR_HTML}" --type html "${PROJECT_DIR}/index.html" > "${BUILD_DIR}/${PROJECT_NAME}/index.html"

#zip minified folder
curr_pwd=`pwd`
cd "${BUILD_DIR}"
zip -9r "${PROJECT_NAME}.zip" "${PROJECT_NAME}"
cd ${curr_pwd}

#cp files to FULL_FOLDER
rm -rf "${BUILD_DIR}/${PROJECT_NAME}/css/"*
rm -rf "${BUILD_DIR}/${PROJECT_NAME}/js/"*

cp -r "${PROJECT_DIR}/css/"* "${BUILD_DIR}/${PROJECT_NAME}/css/"
cp -r "${PROJECT_DIR}/js/"* "${BUILD_DIR}/${PROJECT_NAME}/js/"
cp ${PROJECT_DIR}/index.html "${BUILD_DIR}/${PROJECT_NAME}"

size=`du -s -B1 --apparent-size "${BUILD_DIR}/${PROJECT_NAME}.zip" | awk '{print $1}'`

left=$(($FILE_SIZE_LIMIT - $size))
percent=`echo "scale=2; ${size}*100/${FILE_SIZE_LIMIT}" | bc`

if [ ${size} -lt ${FILE_SIZE_LIMIT} ]; then
  percent_2=`echo "scale=0; ${size}*100/${FILE_SIZE_LIMIT}" | bc`
  echo "That went well. Current file size: ${size} bytes, size left: ${left} bytes."
  echo "This is ${percent}% filled:"
  visualise ${percent_2}
else
  echo ""
  echo ""
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "HOLY FUCK, it's not OK!"
  echo "Current file size: ${size} bytes, size left: ${left} bytes."
  echo "This is ${percent}% filled:"
fi
