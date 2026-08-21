import type { AdminModel } from "@snipmatic/utils";
import { api } from "../axios";

export abstract class AdminApi {
  static async overview() {
    const res = await api.get("/admin/overview");
    return res.data as AdminModel["overviewResponse"];
  }

  static async users(params: AdminModel["usersQuery"]) {
    const res = await api.get("/admin/users", { params });
    return res.data as AdminModel["usersResponse"];
  }

  static async jobs(params: AdminModel["jobsQuery"]) {
    const res = await api.get("/admin/jobs", { params });
    return res.data as AdminModel["jobsResponse"];
  }
}
