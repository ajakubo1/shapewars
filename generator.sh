COMPRESSOR_HOME="/home/claim/software"
COMPRESSOR_YUI="yuicompressor-2.4.8.jar"
COMPRESSOR_HTML="htmlcompressor-1.5.3.jar"
PROJECT_DIR="/home/claim/programming/gamedev/shapewars"
BUILD_DIR="${PROJECT_DIR}/_build"
DEPLOY_DIR="/home/claim/programming/gamedev/deploy"
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
rm -rf "${DEPLOY_DIR}/${PROJECT_NAME}"
rm "${BUILD_DIR}/${PROJECT_NAME}.zip"

#create mini/full folders
mkdir "${BUILD_DIR}/${PROJECT_NAME}"

#generate folders
mkdir "${BUILD_DIR}/${PROJECT_NAME}/game"

#cp files which don't have to be minified

#minify js and css files
java -jar "${COMPRESSOR_HOME}/${COMPRESSOR_YUI}" --type css "${PROJECT_DIR}/game/s.css" > "${BUILD_DIR}/${PROJECT_NAME}/game/s.css"

java -jar "${COMPRESSOR_HOME}/${COMPRESSOR_YUI}" --type js "${PROJECT_DIR}/game/c.js" > "${BUILD_DIR}/${PROJECT_NAME}/game/c.js"
java -jar "${COMPRESSOR_HOME}/${COMPRESSOR_YUI}" --type js "${PROJECT_DIR}/game/s.js" > "${BUILD_DIR}/${PROJECT_NAME}/game/s.js"
cat "${PROJECT_DIR}/game.json" | json-minify > "${BUILD_DIR}/${PROJECT_NAME}/game.json"
cat "${PROJECT_DIR}/game/package.json" | json-minify > "${BUILD_DIR}/${PROJECT_NAME}/game/package.json"
java -jar "${COMPRESSOR_HOME}/${COMPRESSOR_HTML}" --type html "${PROJECT_DIR}/game/index.html" > "${BUILD_DIR}/${PROJECT_NAME}/game/index.html"

#zip minified folder
curr_pwd=`pwd`
cd "${BUILD_DIR}"
zip -9r "${PROJECT_NAME}.zip" "${PROJECT_NAME}"
cd ${curr_pwd}

cp -r "${BUILD_DIR}/${PROJECT_NAME}" "${DEPLOY_DIR}"

#cp files to FULL_FOLDER
rm "${BUILD_DIR}/${PROJECT_NAME}/game/"*
rm "${BUILD_DIR}/${PROJECT_NAME}/game.json"

cp -r "${PROJECT_DIR}/game/"* "${BUILD_DIR}/${PROJECT_NAME}/game/"
cp -r "${PROJECT_DIR}/game.json" "${BUILD_DIR}/${PROJECT_NAME}/"

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
