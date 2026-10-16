                                        <tr>
											<td className="text-center text-success fw-bold">
												<FaCheck className="ms-1" />
											</td>
											<td className="text-center d-flex align-items-center justify-content-center">
												<Form.Select
													size="sm"
													//value={selectedRoData[id]}
													onChange={(e) =>
														handleDropdownChange(index, e.target.value)
													}
													className="me-2"
												>
													<option value="Approved">Approved</option>
													<option value="Send to Back">Send to Back</option>
													<option value="Hold Salary">Hold Salary</option>
												</Form.Select>

												<Button
													variant=""
													size="sm p-0"
													onClick={() =>
														handleShowRoComments(index)
													}
												>
													<FaInfoCircle
														style={{ fontSize: "12px" }}
														className="ms-1"
													/>
												</Button>
											</td>

											<td className="text-center">
												<a href="https://www.google.com/">
													https://www.google.com/
												</a>
											</td>

											<td className="text-center text-success fw-bold">
												<FaCheck className="ms-1" />
											</td>
											<td className="text-center">
												<Form.Select
													size="sm"
													value={selectedRoData[id]}
													onChange={(e) =>
														handleDropdownChange(index, e.target.value)
													}
												>
													<option value="Approved">Approved</option>
													<option value="Send to Back">Send to Back</option>
													<option value="Hold Salary">Hold Salary</option>
												</Form.Select>
											</td>
											<td className="text-center">
												<a href="https://www.google.com/">
													https://www.google.com/
												</a>
											</td>

											<td className="text-center text-success fw-bold">
												<FaCheck className="ms-1" />
											</td>
											<td className="text-center">
												<div className="d-flex align-items-center">
													<Form.Select
														size="sm"
														value={selectedRoData[index]}
														onChange={(e) =>
															handleDropdownChange(index, e.target.value)
														}
														className="me-2" // Optional: adds margin to the right of the dropdown
													>
														<option value="Approved">Approved</option>
														<option value="Send to Back">Send to Back</option>
														<option value="Hold Salary">Hold Salary</option>
													</Form.Select>

													<Button
														variant=""
														size="sm"
														className="p-0" // Optional: removes padding to make the button fit better
														onClick={() =>
															handleShowRoComments(index)
														}
													>
														<FaInfoCircle
															style={{ fontSize: "12px" }}
															className="ms-1"
														/>
													</Button>
												</div>
											</td>

											<td className="text-center">
												<a href="https://www.google.com/">
													https://www.google.com/
												</a>
											</td>

											<td className="text-center text-success fw-bold">
												<FaCheck className="ms-1" />
											</td>
											<td className="text-center">
												<div className="d-flex align-items-center">
													<Form.Select
														size="sm"
														value={selectedRoData[id]}
														onChange={(e) =>
															//handleDropdownChange(id, e.target.value)
														}
														className="me-2" // Optional: adds margin to the right of the dropdown
													>
														<option value="Approved">Approved</option>
														<option value="Send to Back">Send to Back</option>
														<option value="Hold Salary">Hold Salary</option>
													</Form.Select>

													<Button
														variant=""
														size="sm"
														className="p-0" // Optional: removes padding to make the button fit better
														onClick={() =>
															//handleShowRoComments(name, roComments[id])
														}
													>
														<FaInfoCircle
															style={{ fontSize: "12px" }}
															className="ms-1"
														/>
													</Button>
												</div>
											</td>

											<td className="text-center">
												<a href="https://www.google.com/">
													https://www.google.com/
												</a>
											</td>
										</tr>