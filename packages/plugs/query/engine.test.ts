import { expect, test } from "@jest/globals";
import { applyQuery } from "./engine";
import { parseQuery } from "./parser";

test("Test parser", () => {
  let parsedBasicQuery = parseQuery(`page`);
  expect(parsedBasicQuery.table).toBe("page");

  let parsedQuery1 = parseQuery(
    `task where completed = false and dueDate <= "{{today}}" order by dueDate desc limit 5`
  );
  expect(parsedQuery1.table).toBe("task");
  expect(parsedQuery1.orderBy).toBe("dueDate");
  expect(parsedQuery1.orderDesc).toBe(true);
  expect(parsedQuery1.limit).toBe(5);
  expect(parsedQuery1.filter.length).toBe(2);
  expect(parsedQuery1.filter[0]).toStrictEqual({
    op: "=",
    prop: "completed",
    value: false,
  });
  expect(parsedQuery1.filter[1]).toStrictEqual({
    op: "<=",
    prop: "dueDate",
    value: "{{today}}",
  });

  let parsedQuery2 = parseQuery(`page where name =~ /interview\\/.*/"`);
  expect(parsedQuery2.table).toBe("page");
  expect(parsedQuery2.filter.length).toBe(1);
  expect(parsedQuery2.filter[0]).toStrictEqual({
    op: "=~",
    prop: "name",
    value: "interview\\/.*",
  });

  let parsedQuery3 = parseQuery(`page where something != null`);
  expect(parsedQuery3.table).toBe("page");
  expect(parsedQuery3.filter.length).toBe(1);
  expect(parsedQuery3.filter[0]).toStrictEqual({
    op: "!=",
    prop: "something",
    value: null,
  });

  expect(parseQuery(`page select name`).select).toStrictEqual(["name"]);
  expect(parseQuery(`page select name, age`).select).toStrictEqual([
    "name",
    "age",
  ]);

  expect(
    parseQuery(`gh-events where type in ["PushEvent", "somethingElse"]`)
  ).toStrictEqual({
    table: "gh-events",
    filter: [
      {
        op: "in",
        prop: "type",
        value: ["PushEvent", "somethingElse"],
      },
    ],
  });

  expect(parseQuery(`something render [[template/table]]`)).toStrictEqual({
    table: "something",
    filter: [],
    render: "template/table",
  });

  expect(parseQuery(`something render "template/table"`)).toStrictEqual({
    table: "something",
    filter: [],
    render: "template/table",
  });
});

test("Test applyQuery", () => {
  let data: any[] = [
    { name: "interview/My Interview", lastModified: 1 },
    { name: "interview/My Interview 2", lastModified: 2 },
    { name: "Pete", age: 38 },
    { name: "Angie", age: 28 },
  ];

  expect(
    applyQuery(parseQuery(`page where name =~ /interview\\/.*/`), data)
  ).toStrictEqual([
    { name: "interview/My Interview", lastModified: 1 },
    { name: "interview/My Interview 2", lastModified: 2 },
  ]);
  expect(
    applyQuery(
      parseQuery(`page where name =~ /interview\\/.*/ order by lastModified`),
      data
    )
  ).toStrictEqual([
    { name: "interview/My Interview", lastModified: 1 },
    { name: "interview/My Interview 2", lastModified: 2 },
  ]);
  expect(
    applyQuery(
      parseQuery(
        `page where name  =~ /interview\\/.*/ order by lastModified desc`
      ),
      data
    )
  ).toStrictEqual([
    { name: "interview/My Interview 2", lastModified: 2 },
    { name: "interview/My Interview", lastModified: 1 },
  ]);
  expect(applyQuery(parseQuery(`page where age > 30`), data)).toStrictEqual([
    { name: "Pete", age: 38 },
  ]);
  expect(
    applyQuery(parseQuery(`page where age > 28 and age < 38`), data)
  ).toStrictEqual([]);
  expect(
    applyQuery(parseQuery(`page where age > 30 select name`), data)
  ).toStrictEqual([{ name: "Pete" }]);

  expect(
    applyQuery(parseQuery(`page where name in ["Pete"] select name`), data)
  ).toStrictEqual([{ name: "Pete" }]);
});

test("Test applyQuery with multi value", () => {
  let data: any[] = [
    { name: "Pete", children: ["John", "Angie"] },
    { name: "Angie", children: ["Angie"] },
    { name: "Steve" },
  ];

  expect(
    applyQuery(parseQuery(`page where children = "Angie"`), data)
  ).toStrictEqual([
    { name: "Pete", children: ["John", "Angie"] },
    { name: "Angie", children: ["Angie"] },
  ]);

  expect(
    applyQuery(parseQuery(`page where children = ["Angie", "John"]`), data)
  ).toStrictEqual([
    { name: "Pete", children: ["John", "Angie"] },
    { name: "Angie", children: ["Angie"] },
  ]);
});
