import moduleAlias from "module-alias";
import path from "path";

if (__filename.includes("dist")) {
  moduleAlias.addAlias("@", path.join(__dirname));
}
