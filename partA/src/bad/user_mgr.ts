export class usr_mgr {
  public db_conn: any;

  public users_arr: Array<any> = [];
  public do_user_op(obj: any, flag: number, timeout: number): any {
    return obj;
  }
  public get_u(id_or_email: string, flag: number): string {
    return "";
  }
  public find(q: string): any[] {
    return [];
  }
}
